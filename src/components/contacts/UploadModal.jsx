import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Modal from "../shared/Modal.jsx";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";
import ProgressBar from "../shared/ProgressBar.jsx";
import {
  getPresignedUrl,
  confirmUpload,
  getUploadJob,
} from "../../api/contacts.js";

const STEPS = {
  IDLE: "idle",
  PRESIGNING: "presigning",
  UPLOADING: "uploading",
  CONFIRMING: "confirming",
  POLLING: "polling",
  DONE: "done",
  ERROR: "error",
};

export default function UploadModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(STEPS.IDLE);
  const [jobId, setJobId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadPct, setUploadPct] = useState(0);
  const fileRef = useRef();
  const queryClient = useQueryClient();

  // Poll upload job progress
  const { data: jobData } = useQuery({
    queryKey: ["upload-job", jobId],
    queryFn: () => getUploadJob(jobId),
    enabled: !!jobId && step === STEPS.POLLING,
    refetchInterval: (query) => {
      const data = query?.state?.data;
      if (!data) return 2000;
      if (data.status === "done" || data.status === "failed") return false;
      return 2000;
    },
  });

  // Handle status changes using useEffect instead of onSuccess
  useEffect(() => {
    if (!jobData) return;

    if (jobData.status === "done" && step === STEPS.POLLING) {
      setStep(STEPS.DONE);
      toast.success(
        `Upload complete! ${jobData.successCount.toLocaleString()} contacts imported.`,
      );
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    } else if (jobData.status === "failed" && step === STEPS.POLLING) {
      setStep(STEPS.ERROR);
      setErrorMsg("Processing failed. Check error details below.");
    }
  }, [jobData, step, queryClient]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.name.endsWith(".csv")) {
      toast.error("Only .csv files are accepted");
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setErrorMsg("");

    try {
      // STEP 1: Get presigned URL from backend
      setStep(STEPS.PRESIGNING);
      const {
        jobId: jId,
        presignedUrl,
        s3Key,
      } = await getPresignedUrl(file.name);
      setJobId(jId);

      // STEP 2: Upload directly to S3 using native fetch (NOT axios, NOT FormData)
      setStep(STEPS.UPLOADING);
      setUploadPct(0);

      const xhr = new XMLHttpRequest();
      await new Promise((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setUploadPct(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () =>
          xhr.status === 200
            ? resolve()
            : reject(new Error(`S3 upload failed: ${xhr.status}`));
        xhr.onerror = () => reject(new Error("S3 upload network error"));
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", "text/csv");
        xhr.send(file);
      });

      // STEP 3: Confirm with backend, trigger BullMQ job
      setStep(STEPS.CONFIRMING);
      await confirmUpload(jId, s3Key);

      // STEP 4: Start polling
      setStep(STEPS.POLLING);
    } catch (err) {
      setStep(STEPS.ERROR);
      setErrorMsg(err.message);
      toast.error(err.message);
    }
  };

  const handleClose = () => {
    if ([STEPS.PRESIGNING, STEPS.UPLOADING, STEPS.CONFIRMING].includes(step))
      return;
    setFile(null);
    setStep(STEPS.IDLE);
    setJobId(null);
    setErrorMsg("");
    setUploadPct(0);
    onClose();
  };

  const isProcessing = [
    STEPS.PRESIGNING,
    STEPS.UPLOADING,
    STEPS.CONFIRMING,
    STEPS.POLLING,
  ].includes(step);
  const isDone = step === STEPS.DONE;

  const stepLabel = {
    [STEPS.PRESIGNING]: "Getting upload URL...",
    [STEPS.UPLOADING]: `Uploading to S3... ${uploadPct}%`,
    [STEPS.CONFIRMING]: "Starting processor...",
    [STEPS.POLLING]: "Processing CSV...",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Contacts from CSV"
    >
      <div className="space-y-5">
        {/* File picker */}
        {!isProcessing && !isDone && (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="hidden"
            />
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            {file ? (
              <p className="font-medium text-gray-900">
                {file.name}{" "}
                <span className="text-gray-400 text-sm">
                  ({(file.size / 1024 / 1024).toFixed(1)}MB)
                </span>
              </p>
            ) : (
              <>
                <p className="font-medium text-gray-700">
                  Click to select CSV file
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Supports up to 50,000 rows
                </p>
              </>
            )}
          </div>
        )}

        {/* Upload progress */}
        {step === STEPS.UPLOADING && (
          <ProgressBar value={uploadPct} max={100} color="blue" />
        )}

        {/* Processing status */}
        {(isProcessing || isDone) && jobData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Processing status
              </span>
              <span
                className={`badge ${
                  isDone
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {isDone ? "done" : "processing"}
              </span>
            </div>

            {jobData.totalRows > 0 && (
              <ProgressBar
                value={jobData.successCount + jobData.failureCount}
                max={jobData.totalRows}
                color="green"
              />
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {jobData.totalRows?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500">Total Rows</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-green-700">
                  {jobData.successCount?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500">Imported</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-red-600">
                  {jobData.failureCount?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500">Skipped</p>
              </div>
            </div>

            {jobData.errors?.length > 0 && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs font-medium text-red-700 mb-2">
                  First {jobData.errors.length} errors:
                </p>
                <ul className="text-xs text-red-600 space-y-0.5 max-h-24 overflow-y-auto">
                  {jobData.errors.slice(0, 10).map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step indicator */}
        {isProcessing && (
          <div className="flex items-center gap-3 text-sm text-blue-600">
            <LoadingSpinner size="sm" />
            <span>{stepLabel[step]}</span>
          </div>
        )}

        {/* Error */}
        {step === STEPS.ERROR && errorMsg && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleClose}
            disabled={[
              STEPS.PRESIGNING,
              STEPS.UPLOADING,
              STEPS.CONFIRMING,
            ].includes(step)}
            className="btn-secondary"
          >
            {isDone ? "Close" : step === STEPS.POLLING ? "Run in Background" : "Cancel"}
          </button>
          {!isProcessing && !isDone && (
            <button
              onClick={handleUpload}
              disabled={!file}
              className="btn-primary"
            >
              Upload & Import
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
