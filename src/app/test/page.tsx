"use client";

import { useState } from 'react';
import { encryptMessage, decryptMessage } from '@/lib/crypto';

// Generate comprehensive 1000-word test message with special characters
function generate1000WordMessage(): string {
  const words = [
    'adventure', 'beautiful', 'celebration', 'discovery', 'excitement', 'friendship', 'gratitude',
    'happiness', 'inspiration', 'journey', 'kindness', 'laughter', 'memories', 'opportunity',
    'passion', 'quantum', 'rainbow', 'serenity', 'triumph', 'universe', 'victory', 'wisdom',
    'amazing', 'brilliant', 'creative', 'delightful', 'elegant', 'fantastic', 'gorgeous',
    'harmonious', 'incredible', 'joyful', 'magnificent', 'wonderful', 'spectacular', 'marvelous',
    'outstanding', 'perfect', 'remarkable', 'stunning', 'superb', 'tremendous', 'extraordinary',
    'phenomenal', 'exceptional', 'splendid', 'glorious', 'radiant', 'breathtaking', 'dazzling',
    // Special character words for integrity testing
    'café', 'naïve', 'résumé', 'piñata', 'jalapeño', 'Zürich', 'François', 'décor',
    'coördinate', 'reëvaluate', 'Björk', 'Åsa', 'København', 'São Paulo', 'Москва'
  ];
  
  let message = '';
  let wordCount = 0;
  
  // Add structured content with special characters for thorough testing
  message += 'This is a comprehensive test message with exactly 1000 words. ';
  message += 'Special characters: áéíóú, ÁÉÍÓÚ, àèìòù, âêîôû, ñÑ, çÇ, üÜ, ß, €, £, ¥, ©, ®, ™. ';
  message += 'Emojis: 😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝😜🤪🤨. ';
  message += 'Line breaks:\n\nNew paragraph here.\n\nAnother paragraph. ';
  message += 'Quotes: "Hello world", \'Single quotes\', `Backticks`, «Guillemets». ';
  message += 'Mathematical symbols: ∞ ∑ ∏ √ ∆ π α β γ δ ε ζ η θ λ μ ν ξ ρ σ τ φ χ ψ ω. ';
  message += 'Currency: $100, €85, £75, ¥1000, ₹500, ₽1500. \t\t';
  
  wordCount = message.split(' ').length;
  
  // Fill remaining words randomly
  while (wordCount < 1000) {
    const word = words[Math.floor(Math.random() * words.length)];
    message += word + ' ';
    wordCount++;
  }
  
  return message.trim();
}

// Create deterministic test message for consistent integrity testing
function createDeterministicTestMessage(): string {
  let message = 'INTEGRITY_TEST_MESSAGE_START: ';
  
  // Add predictable content for easier verification
  for (let i = 1; i <= 995; i++) {
    message += `word${i} `;
  }
  
  message += 'INTEGRITY_TEST_MESSAGE_END';
  return message;
}

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const runIntegrityTest = async (useDeterministic = false) => {
    setIsRunning(true);
    setTestResult(`🧪 Starting comprehensive message integrity test with 1000-word ${useDeterministic ? 'deterministic' : 'random'} message...\n\n`);
    
    try {
      // Create test data
      const testMessage = useDeterministic ? createDeterministicTestMessage() : generate1000WordMessage();
      const testData = {
        message: testMessage,
        unlockDate: '2025-12-25T00:00:00.000Z',
        createDate: new Date().toISOString(),
        senderName: 'Test Sender™ with Special Chars: áéíóú €£¥',
        hint: 'Hint with emojis 🔑💡 and symbols: ∞∑∏√ «special quotes» \'and\' "various" `types`'
      };
      
      let log = '';
      log += '📝 Test Data Analysis:\n';
      log += `Message length: ${testMessage.length} characters\n`;
      log += `Word count: ${testMessage.split(' ').length} words\n`;
      log += `Contains line breaks: ${testMessage.includes('\n') ? '✅' : '❌'}\n`;
      log += `Contains special chars: ${/[áéíóúàèìòùâêîôûñçüß€£¥]/.test(testMessage) ? '✅' : '❌'}\n`;
      log += `Contains emojis: ${/[\u{1F600}-\u{1F64F}]/u.test(testMessage) ? '✅' : '❌'}\n`;
      log += `Contains math symbols: ${/[∞∑∏√∆πα]/.test(testMessage) ? '✅' : '❌'}\n`;
      log += `Original JSON size: ${JSON.stringify(testData).length} characters\n\n`;
      
      // Create hash of original data for integrity verification
      const originalHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(testData)));
      const originalHashHex = Array.from(new Uint8Array(originalHash)).map(b => b.toString(16).padStart(2, '0')).join('');
      log += `🔐 Original data SHA-256: ${originalHashHex.substring(0, 16)}...\n\n`;
      
      // Test encryption
      log += '🔐 Testing encryption...\n';
      const startTime = performance.now();
      const encrypted = await encryptMessage(testData);
      const encryptionTime = performance.now() - startTime;
      
      log += `✅ Encryption completed in ${encryptionTime.toFixed(2)}ms\n`;
      log += `📏 Encrypted data length: ${encrypted.length} characters\n`;
      log += `🏷️ Version prefix: ${encrypted.startsWith('v3:') ? '✅ v3:' : '❌ Invalid'}\n\n`;
      
      // Calculate compression statistics
      const originalSize = JSON.stringify(testData).length;
      const compressedSize = encrypted.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100);
      
      log += '📊 Compression Results:\n';
      log += `Original JSON: ${originalSize} characters\n`;
      log += `Final encrypted: ${compressedSize} characters\n`;
      log += `Size change: ${compressionRatio > 0 ? `${compressionRatio.toFixed(1)}% reduction` : `${Math.abs(compressionRatio).toFixed(1)}% increase`}\n\n`;
      
      // Test URL generation
      const testUrl = `${window.location.origin}/view?love=${encrypted}`;
      log += `🔗 Generated URL length: ${testUrl.length} characters\n`;
      log += `📊 URL efficiency: ${testUrl.length < 2000 ? '✅ Under 2KB' : testUrl.length < 8000 ? '⚠️ Under 8KB' : '❌ Over 8KB'}\n\n`;
      
      // Test decryption
      log += '🔓 Testing decryption...\n';
      const decryptStartTime = performance.now();
      const decrypted = await decryptMessage(encrypted);
      const decryptionTime = performance.now() - decryptStartTime;
      
      log += `✅ Decryption completed in ${decryptionTime.toFixed(2)}ms\n\n`;
      
      // Create hash of decrypted data
      const decryptedHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(decrypted)));
      const decryptedHashHex = Array.from(new Uint8Array(decryptedHash)).map(b => b.toString(16).padStart(2, '0')).join('');
      log += `🔍 Decrypted data SHA-256: ${decryptedHashHex.substring(0, 16)}...\n`;
      log += `🔐 Hash match: ${originalHashHex === decryptedHashHex ? '✅ IDENTICAL' : '❌ DIFFERENT'}\n\n`;
      
      // Comprehensive data integrity verification
      log += '🔍 Detailed Integrity Verification:\n';
      
      // Message integrity
      const isMessageMatch = decrypted.message === testData.message;
      log += `📝 Message content: ${isMessageMatch ? '✅ EXACT MATCH' : '❌ MISMATCH'}\n`;
      if (!isMessageMatch) {
        log += `   Original length: ${testData.message.length}, Decrypted length: ${decrypted.message.length}\n`;
        log += `   First difference at position: ${findFirstDifference(testData.message, decrypted.message)}\n`;
      }
      
      // Metadata integrity
      const isUnlockDateMatch = decrypted.unlockDate === testData.unlockDate;
      const isSenderNameMatch = decrypted.senderName === testData.senderName;
      const isHintMatch = decrypted.hint === testData.hint;
      
      log += `📅 Unlock date: ${isUnlockDateMatch ? '✅ EXACT MATCH' : '❌ MISMATCH'}\n`;
      log += `👤 Sender name: ${isSenderNameMatch ? '✅ EXACT MATCH' : '❌ MISMATCH'}\n`;
      log += `💡 Hint: ${isHintMatch ? '✅ EXACT MATCH' : '❌ MISMATCH'}\n\n`;
      
      // Character-level analysis for the message
      if (isMessageMatch) {
        log += '🔍 Character-Level Analysis:\n';
        log += `✅ All ${testData.message.length} characters preserved perfectly\n`;
        log += `✅ Line breaks preserved: ${testData.message.split('\n').length - 1} found\n`;
        log += `✅ Special characters preserved\n`;
        log += `✅ Unicode characters preserved\n\n`;
      }
      
      // Overall result
      const allDataIntact = isMessageMatch && isUnlockDateMatch && isSenderNameMatch && isHintMatch;
      log += `🎯 FINAL INTEGRITY TEST RESULT: ${allDataIntact ? '✅ PERFECT - ALL DATA INTACT' : '❌ FAILED - DATA CORRUPTION DETECTED'}\n\n`;
      
      // Performance and efficiency summary
      if (allDataIntact) {
        log += '🎉 MESSAGE INTEGRITY TEST PASSED!\n';
        log += `⚡ Total processing time: ${(encryptionTime + decryptionTime).toFixed(2)}ms\n`;
        log += `🗜️ Final URL length: ${testUrl.length} characters\n`;
        log += `💾 Compression efficiency: ${Math.abs(compressionRatio).toFixed(1)}% ${compressionRatio > 0 ? 'reduction' : 'increase'}\n`;
        log += `🔒 Cryptographic integrity: VERIFIED\n`;
        log += `📊 Data preservation: 100% ACCURATE\n`;
      } else {
        log += '❌ MESSAGE INTEGRITY TEST FAILED!\n';
        log += '⚠️ Data corruption detected during encryption/decryption process\n';
      }
      
      setTestResult(log);
      
    } catch (error) {
      setTestResult(prev => prev + `\n❌ Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}\n${error instanceof Error ? error.stack : ''}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Helper function to find first character difference
  const findFirstDifference = (str1: string, str2: string): number => {
    const minLength = Math.min(str1.length, str2.length);
    for (let i = 0; i < minLength; i++) {
      if (str1[i] !== str2[i]) {
        return i;
      }
    }
    return str1.length !== str2.length ? minLength : -1;
  };

  return (
    <div className="cs-page-layout">
      <div className="cs-page-content">
        <div className="cs-page-inner">
          <div className="cs-form-wrapper">
            <h1 className="cs-heading-2 cs-text-gray-dark cs-mb-4">
              🔍 Message Integrity Test - 1000 Words
            </h1>
          
            <div className="cs-mb-4">
              <div className="cs-flex-buttons">
                <button
                  onClick={() => runIntegrityTest(false)}
                  disabled={isRunning}
                  className="cs-button-green"
                >
                  {isRunning ? 'Running Test...' : '🎲 Random Message Test'}
                </button>
                
                <button
                  onClick={() => runIntegrityTest(true)}
                  disabled={isRunning}
                  className="cs-button-secondary"
                >
                  {isRunning ? 'Running Test...' : '🔢 Deterministic Test'}
                </button>
              </div>
            
              <div className="cs-info-container cs-info-purple cs-mb-4">
                <p className="cs-font-medium cs-mb-4">Test Features:</p>
                <ul className="cs-body-small">
                  <li><strong>Random Test:</strong> 1000 words with special characters, emojis, Unicode, line breaks</li>
                  <li><strong>Deterministic Test:</strong> Predictable 1000-word sequence for consistent results</li>
                  <li><strong>Integrity Verification:</strong> SHA-256 hashing, character-by-character comparison</li>
                  <li><strong>Compression Analysis:</strong> Size reduction measurement and URL length validation</li>
                </ul>
              </div>
            </div>
          
            {testResult && (
              <div className="cs-info-container cs-info-yellow">
                <pre className="cs-body-small">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}