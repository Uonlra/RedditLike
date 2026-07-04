import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../styles/CreateCommunityModal.css";

interface CreateCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateCommunityModal = ({
    isOpen,
    onClose,
}: CreateCommunityModalProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const createSubreddit = useMutation(api.subreddit.create);

    if (!isOpen) return null;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        const communityName = name.trim();
        const communityDescription = description.trim();

        if (!communityName) {
            setError("Community name is required.");
            return;
        }

        if (communityName.length < 3 || communityName.length > 21) {
            setError("Community name must be between 3 and 21 characters.");
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(communityName)) {
            setError("Community name can only contain letters, numbers and underscores.");
            return;
        }

        setIsLoading(true);
        try {
            await createSubreddit({
                name: communityName,
                description: communityDescription || undefined,
            });
            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred while creating the community.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose} />
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Create a Community</h2>
                    <button type="button" className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <div className="input-prefix">r/</div>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="community_name"
                            maxLength={21}
                            disabled={isLoading}
                        />
                        <p className="input-help">
                            Community names including capitalization cannot be changed.
                        </p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">
                            Description <span>(optional)</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Tell us about your community"
                            maxLength={100}
                            disabled={isLoading}
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="create-button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating..." : "Create Community"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateCommunityModal;
