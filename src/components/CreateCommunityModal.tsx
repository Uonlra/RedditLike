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
            setError("请输入社区名称。");
            return;
        }

        if (communityName.length < 3 || communityName.length > 21) {
            setError("社区名称长度需为 3 到 21 个字符。");
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(communityName)) {
            setError("社区名称只能包含字母、数字和下划线。");
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
                    : "创建社区时出错，请稍后重试。",
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
                    <h2>创建社区</h2>
                    <button type="button" className="close-button" onClick={onClose} aria-label="关闭创建社区弹窗">
                        &times;
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">名称</label>
                        <div className="input-prefix">r/</div>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="社区名称"
                            maxLength={21}
                            disabled={isLoading}
                        />
                        <p className="input-help">
                            社区名称创建后无法修改，包括大小写。
                        </p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">
                            描述 <span>（可选）</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="社区描述（可选）"
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
                            取消
                        </button>
                        <button
                            type="submit"
                            className="create-button"
                            disabled={isLoading}
                        >
                            {isLoading ? "创建中..." : "创建社区"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateCommunityModal;
