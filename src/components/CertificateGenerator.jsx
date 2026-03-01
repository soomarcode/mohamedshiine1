import React, { useRef, useState, useEffect } from 'react';

const CertificateGenerator = ({ isOpen, onClose, course, user, templateUrl, signatureUrl }) => {
    const canvasRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
    const avatarUrl = user?.user_metadata?.avatar_url || null;

    useEffect(() => {
        if (!isOpen || !templateUrl) return;
        setIsReady(false);
        renderCertificate();
    }, [isOpen, templateUrl]);

    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image: ' + src));
            img.src = src;
        });
    };

    const renderCertificate = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        try {
            // Load template
            const templateImg = await loadImage(templateUrl);

            // Set canvas size to template size
            canvas.width = templateImg.width;
            canvas.height = templateImg.height;

            // Draw template background
            ctx.drawImage(templateImg, 0, 0);

            const w = canvas.width;
            const h = canvas.height;

            // Draw user avatar (circular, centered near top)
            if (avatarUrl) {
                try {
                    const avatarImg = await loadImage(avatarUrl);
                    const avatarSize = Math.min(w * 0.12, 120);
                    const avatarX = (w - avatarSize) / 2;
                    const avatarY = h * 0.28;

                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
                    ctx.restore();

                    // Avatar border
                    ctx.beginPath();
                    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
                    ctx.strokeStyle = '#15803d';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                } catch (e) {
                    console.warn('Could not load avatar:', e);
                }
            }

            // Draw student name - centered, prominent
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const nameFontSize = Math.max(w * 0.045, 28);
            ctx.font = `bold ${nameFontSize}px 'Georgia', 'Times New Roman', serif`;
            ctx.fillStyle = '#1a2332';
            ctx.fillText(displayName, w / 2, h * 0.48);

            // Draw decorative line under name
            const lineWidth = Math.min(w * 0.3, 300);
            ctx.beginPath();
            ctx.moveTo((w - lineWidth) / 2, h * 0.52);
            ctx.lineTo((w + lineWidth) / 2, h * 0.52);
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw course title
            const courseFontSize = Math.max(w * 0.025, 16);
            ctx.font = `600 ${courseFontSize}px 'Arial', sans-serif`;
            ctx.fillStyle = '#475569';
            ctx.fillText(`Course: ${course?.title || 'Course'}`, w / 2, h * 0.58);

            // Draw completion date
            const dateFontSize = Math.max(w * 0.018, 13);
            ctx.font = `${dateFontSize}px 'Arial', sans-serif`;
            ctx.fillStyle = '#64748b';
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            ctx.fillText(`Completed on ${today}`, w / 2, h * 0.63);

            // Draw signature if available
            if (signatureUrl) {
                try {
                    const sigImg = await loadImage(signatureUrl);
                    const sigHeight = Math.min(h * 0.08, 60);
                    const sigWidth = (sigImg.width / sigImg.height) * sigHeight;
                    const sigX = (w - sigWidth) / 2;
                    const sigY = h * 0.72;
                    ctx.drawImage(sigImg, sigX, sigY, sigWidth, sigHeight);

                    // Signature label
                    ctx.font = `${Math.max(w * 0.014, 11)}px 'Arial', sans-serif`;
                    ctx.fillStyle = '#94a3b8';
                    ctx.fillText('Authorized Signature', w / 2, sigY + sigHeight + 15);
                } catch (e) {
                    console.warn('Could not load signature:', e);
                }
            }

            setIsReady(true);
        } catch (error) {
            console.error('Error rendering certificate:', error);
            alert('Failed to load certificate template. Please try again.');
        }
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIsDownloading(true);

        try {
            const link = document.createElement('a');
            link.download = `Certificate-${course?.title || 'Course'}-${displayName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('Download error:', e);
            alert('Failed to download. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="certificate-modal" onClick={e => e.stopPropagation()}>
                <div className="certificate-modal-header">
                    <h2>🎓 Your Certificate</h2>
                    <button className="btn-cancel-payment" onClick={onClose}>✕</button>
                </div>

                <div className="certificate-canvas-wrapper">
                    <canvas
                        ref={canvasRef}
                        className="certificate-canvas"
                    />
                    {!isReady && (
                        <div className="certificate-loading">
                            Loading certificate...
                        </div>
                    )}
                </div>

                {isReady && (
                    <button className="btn-download-cert" onClick={handleDownload} disabled={isDownloading}>
                        {isDownloading ? 'Downloading...' : '📥 Download Certificate'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CertificateGenerator;
