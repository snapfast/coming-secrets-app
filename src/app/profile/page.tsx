"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  getProfileSecretsWithStatus, 
  deleteSecretFromProfile, 
  clearAllSecrets,
  getProfileStatistics,
  isStorageAvailable,
  ProfileSecret 
} from "@/lib/storage";

export default function ProfilePage() {
  const [secrets, setSecrets] = useState<ProfileSecret[]>([]);
  const [statistics, setStatistics] = useState({
    totalSecrets: 0,
    lockedSecrets: 0,
    unlockedSecrets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Load secrets and statistics
  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isStorageAvailable()) {
        setError("Local storage is not available in your browser");
        return;
      }

      const [secretsData, statsData] = await Promise.all([
        getProfileSecretsWithStatus(),
        getProfileStatistics()
      ]);

      setSecrets(secretsData);
      setStatistics(statsData);
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError("Failed to load your secrets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleCopyLink = async (url: string, secretId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(secretId);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleDeleteSecret = async (secretId: string) => {
    if (!confirm("Are you sure you want to delete this secret? This action cannot be undone.")) {
      return;
    }

    const success = deleteSecretFromProfile(secretId);
    if (success) {
      await loadProfileData(); // Reload data
    } else {
      setError("Failed to delete secret. Please try again.");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete ALL your secrets? This action cannot be undone.")) {
      return;
    }

    const success = clearAllSecrets();
    if (success) {
      await loadProfileData(); // Reload data
    } else {
      setError("Failed to clear all secrets. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSecretStatusBadge = (secret: ProfileSecret) => {
    const badgeClass = secret.isUnlocked ? "cs-badge-unlocked" : "cs-badge-locked";
    const icon = secret.isUnlocked ? "🔓" : "🔒";
    const text = secret.isUnlocked ? "Unlocked" : "Locked";
    
    return (
      <span className={badgeClass}>
        {icon} {text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="cs-page-layout">
        <main className="cs-page-content">
          <div className="cs-page-inner">
            <Header />
            <div className="cs-loading-container">
              <div className="cs-loading-text">
                Loading your secrets...
              </div>
            </div>
            <Footer />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cs-page-layout">
        <main className="cs-page-content">
          <div className="cs-page-inner">
            <Header />
            <div className="cs-error-container">
              <div className="cs-error-card">
                <div className="cs-error-title">
                  Error Loading Profile
                </div>
                <div className="cs-error-message">{error}</div>
                <button
                  onClick={loadProfileData}
                  className="cs-button-danger"
                >
                  Try Again
                </button>
              </div>
            </div>
            <Footer />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="cs-page-layout">
      <main className="cs-page-content">
        <div className="cs-page-inner">
          <Header />
          {/* Page Header */}
          <div className="cs-page-header">
            <h1 className="cs-page-title">My Secret Messages</h1>
            <p className="cs-page-subtitle">
              Manage all the time-locked messages you&apos;ve created
            </p>
          </div>

          {/* Statistics */}
          <div className="cs-stats-container">
            <div className="cs-stats-card">
              <div className="cs-stats-number">{statistics.totalSecrets}</div>
              <div className="cs-stats-label">Total Secrets</div>
            </div>
            <div className="cs-stats-card">
              <div className="cs-stats-number">{statistics.lockedSecrets}</div>
              <div className="cs-stats-label">Still Locked</div>
            </div>
            <div className="cs-stats-card">
              <div className="cs-stats-number">{statistics.unlockedSecrets}</div>
              <div className="cs-stats-label">Unlocked</div>
            </div>
          </div>

          {secrets.length === 0 ? (
            /* Empty State */
            <div className="cs-empty-state">
              <div className="cs-empty-icon">📝</div>
              <h2 className="cs-empty-title">No Secrets Yet</h2>
              <p className="cs-empty-description">
                You haven&apos;t created any time-locked messages yet. Start by creating your first secret!
              </p>
              <Link
                href="/"
                className="cs-button-primary"
              >
                Create Your First Secret
              </Link>
            </div>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="cs-action-buttons">
                <Link
                  href="/"
                  className="cs-primary-action"
                >
                  Create New Secret
                </Link>
                <button
                  onClick={handleClearAll}
                  className="cs-secondary-action"
                >
                  Clear All Secrets
                </button>
              </div>

              {/* Secrets List */}
              <div className="cs-list-container">
                {secrets.map((secret) => (
                  <div key={secret.id} className="cs-list-item">
                    <div className="cs-list-item-content">
                      <div className="cs-list-item-main">
                        <div className="cs-list-item-meta">
                          {getSecretStatusBadge(secret)}
                          <span className="cs-list-item-meta-text">
                            Created {formatDate(secret.createdAt)}
                          </span>
                        </div>
                        
                        <div className="cs-list-item-title">
                          {`"${secret.messagePreview}"`}
                        </div>
                        
                        {secret.senderName && (
                          <div className="cs-list-item-subtitle">
                            From: {secret.senderName}
                          </div>
                        )}
                        
                        {secret.hint && (
                          <div className="cs-list-item-description">
                            Hint: {secret.hint}
                          </div>
                        )}
                        
                        <div className="cs-list-item-date">
                          {secret.isUnlocked ? 'Unlocked' : `Unlocks`} on {formatDate(secret.unlockDate)}
                        </div>
                      </div>
                      
                      <div className="cs-list-item-actions">
                        <button
                          onClick={() => handleCopyLink(secret.encryptedUrl, secret.id)}
                          className="cs-button-secondary"
                        >
                          {copySuccess === secret.id ? 'Copied!' : 'Copy Link'}
                        </button>
                        <button
                          onClick={() => handleDeleteSecret(secret.id)}
                          className="cs-button-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <Footer />
        </div>
      </main>
    </div>
  );
}