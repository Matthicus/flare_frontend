// components/CreateFlareModal.tsx
import { useState } from "react";
import Modal from "./Modal";
import Image from "next/image";

type CreateFlareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFlareData, photo?: File) => Promise<void>;
  selectedPlace?: {
    mapbox_id: string;
    name: string;
  } | null;
  isSubmitting?: boolean;
};

export type CreateFlareData = {
  latitude: number;
  longitude: number;
  note: string;
  place?: {
    mapbox_id: string;
    name: string;
  } | null;
};

const CreateFlareModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedPlace,
  isSubmitting = false,
}: CreateFlareModalProps) => {
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const handleSubmit = async () => {
    const flareData: CreateFlareData = {
      latitude: 0, // This will be overridden by parent
      longitude: 0, // This will be overridden by parent
      note,
      place: selectedPlace,
    };

    try {
      await onSubmit(flareData, photo || undefined);

      // Reset form on success
      setNote("");
      setPhoto(null);
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Failed to submit flare:", error);
    }
  };

  const handleClose = () => {
    setNote("");
    setPhoto(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={handleClose}>
      <div className="space-y-4 p-4 max-h-[80vh] overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col">
        <h1 className="font-semibold text-white text-2xl text-center mb-6">
          Drop a Flare
        </h1>

        {selectedPlace && (
          <div className="text-sm font-semibold text-blue-400 mb-4 bg-blue-900/20 p-2 rounded">
            📍 {selectedPlace.name}
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-white mb-2">Describe your flare</h3>
          <p className="text-sm text-gray-400 mb-3">
            Briefly describe your flare so others know what to expect.
          </p>
          <textarea
            placeholder="What's happening here?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white resize-none focus:ring-2 focus:ring-orange-500 focus:outline-none"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <h3 className="text-white mb-2">Upload a photo (optional)</h3>
          <p className="text-sm text-gray-400 mb-3">
            Add a photo to help others visualize your flare!
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            className="w-full text-sm bg-gray-700 p-3 text-white rounded focus:ring-2 focus:ring-orange-500 focus:outline-none file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-orange-600 file:text-white hover:file:bg-orange-700"
          />
        </div>

        {photo && (
          <div className="relative mb-4">
            <Image
              src={URL.createObjectURL(photo)}
              alt="Preview"
              className="w-full h-40 object-cover rounded"
              width={400}
              height={160}
            />
            <button
              onClick={() => setPhoto(null)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-700 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        <div className="text-xs text-gray-400 mb-4 bg-gray-800/50 p-3 rounded">
          💡 Your flare will start as orange. It changes color automatically
          based on how many people join:
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <Image
                src="/orange_flare.png"
                alt="Orange Flare"
                width={16}
                height={16}
              />
              <span className="text-orange-400">Orange</span>: 1-17 participants
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="/violet_flare.png"
                alt="Violet Flare"
                width={16}
                height={16}
              />
              <span className="text-purple-400">Purple</span>: 18-99
              participants
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="/blue_flare.png"
                alt="Blue Flare"
                width={16}
                height={16}
              />
              <span className="text-blue-400">Blue</span>: 100+ participants
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !note.trim()}
          className="w-full py-3 bg-orange-600 rounded text-white font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600"
        >
          {isSubmitting ? "Creating Flare..." : "Create Flare"}
        </button>
      </div>
    </Modal>
  );
};

export default CreateFlareModal;
