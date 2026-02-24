"use strict";
/**
 * Crypto Utilities for MobileClaw
 *
 * Implements production-grade encryption for vault secrets:
 * - PBKDF2 password hashing (100k iterations, SHA-256)
 * - AES-256-GCM encryption with authentication
 * - Secure key derivation
 *
 * Security Design:
 * 1. Password → PBKDF2 (100k iterations) → Encryption Key (never stored)
 * 2. Each secret encrypted individually with unique IV
 * 3. Encrypted data stored as: IV + EncryptedData + AuthTag
 * 4. Salt stored per-user in SecureStore
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSalt = generateSalt;
exports.deriveKeyFromPassword = deriveKeyFromPassword;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.getUserSalt = getUserSalt;
exports.testEncryption = testEncryption;
exports.testPasswordHashing = testPasswordHashing;
exports.benchmarkCrypto = benchmarkCrypto;
var Crypto = __importStar(require("expo-crypto"));
var SecureStore = __importStar(require("expo-secure-store"));
var aes = __importStar(require("aes-js"));
// Constants
var PBKDF2_ITERATIONS = 100000;
var SALT_LENGTH = 32; // bytes
var KEY_LENGTH = 32; // 256 bits
var IV_LENGTH = 16; // 128 bits (AES block size)
/**
 * Generate a cryptographically secure random salt
 */
function generateSalt() {
    return __awaiter(this, void 0, void 0, function () {
        var saltBytes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Crypto.getRandomBytesAsync(SALT_LENGTH)];
                case 1:
                    saltBytes = _a.sent();
                    return [2 /*return*/, bytesToHex(saltBytes)];
            }
        });
    });
}
/**
 * Derive encryption key from password using PBKDF2
 *
 * @param password User password
 * @param salt Hex-encoded salt
 * @returns Hex-encoded encryption key (32 bytes)
 */
function deriveKeyFromPassword(password, salt) {
    return __awaiter(this, void 0, void 0, function () {
        var passwordBytes, saltBytes, block, u, key, i, j, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    passwordBytes = stringToBytes(password);
                    saltBytes = hexToBytes(salt);
                    block = new Uint8Array(__spreadArray(__spreadArray([], saltBytes, true), [0, 0, 0, 1], false));
                    return [4 /*yield*/, hmacSha256(passwordBytes, block)];
                case 1:
                    u = _a.sent();
                    key = new Uint8Array(u);
                    i = 1;
                    _a.label = 2;
                case 2:
                    if (!(i < PBKDF2_ITERATIONS)) return [3 /*break*/, 5];
                    return [4 /*yield*/, hmacSha256(passwordBytes, u)];
                case 3:
                    u = _a.sent();
                    // XOR with previous result
                    for (j = 0; j < key.length; j++) {
                        key[j] ^= u[j];
                    }
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: 
                // Take first KEY_LENGTH bytes
                return [2 /*return*/, bytesToHex(key.slice(0, KEY_LENGTH))];
                case 6:
                    error_1 = _a.sent();
                    console.error('Key derivation error:', error_1);
                    throw new Error('Failed to derive encryption key');
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * HMAC-SHA256 implementation
 */
function hmacSha256(key, data) {
    return __awaiter(this, void 0, void 0, function () {
        var blockSize, normalizedKey, hash, padded, ipad, opad, i, innerData, innerHash, innerHashBytes, outerData, outerHash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    blockSize = 64;
                    normalizedKey = key;
                    if (!(key.length > blockSize)) return [3 /*break*/, 2];
                    return [4 /*yield*/, Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, bytesToString(key))];
                case 1:
                    hash = _a.sent();
                    normalizedKey = hexToBytes(hash);
                    _a.label = 2;
                case 2:
                    if (normalizedKey.length < blockSize) {
                        padded = new Uint8Array(blockSize);
                        padded.set(normalizedKey);
                        normalizedKey = padded;
                    }
                    ipad = new Uint8Array(blockSize);
                    opad = new Uint8Array(blockSize);
                    for (i = 0; i < blockSize; i++) {
                        ipad[i] = normalizedKey[i] ^ 0x36;
                        opad[i] = normalizedKey[i] ^ 0x5c;
                    }
                    innerData = new Uint8Array(blockSize + data.length);
                    innerData.set(ipad);
                    innerData.set(data, blockSize);
                    return [4 /*yield*/, Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, bytesToString(innerData))];
                case 3:
                    innerHash = _a.sent();
                    innerHashBytes = hexToBytes(innerHash);
                    outerData = new Uint8Array(blockSize + innerHashBytes.length);
                    outerData.set(opad);
                    outerData.set(innerHashBytes, blockSize);
                    return [4 /*yield*/, Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, bytesToString(outerData))];
                case 4:
                    outerHash = _a.sent();
                    return [2 /*return*/, hexToBytes(outerHash)];
            }
        });
    });
}
/**
 * Encrypt data using AES-256-CTR (secure mode with random IV)
 * Note: Using CTR mode instead of GCM for compatibility with aes-js
 * CTR provides encryption, we add HMAC for authentication
 *
 * @param data Plain text data
 * @param key Hex-encoded encryption key (32 bytes)
 * @returns Hex-encoded encrypted data (format: IV + EncryptedData + HMAC)
 */
function encrypt(data, key) {
    return __awaiter(this, void 0, void 0, function () {
        var iv, keyBytes, dataBytes, aesCtr, encryptedBytes, combinedData, hmac, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, Crypto.getRandomBytesAsync(IV_LENGTH)];
                case 1:
                    iv = _a.sent();
                    keyBytes = hexToBytes(key);
                    dataBytes = stringToBytes(data);
                    aesCtr = new aes.ModeOfOperation.ctr(keyBytes, Array.from(iv));
                    encryptedBytes = aesCtr.encrypt(dataBytes);
                    combinedData = new Uint8Array(iv.length + encryptedBytes.length);
                    combinedData.set(iv);
                    combinedData.set(encryptedBytes, iv.length);
                    return [4 /*yield*/, hmacSha256(keyBytes, combinedData)];
                case 2:
                    hmac = _a.sent();
                    result = new Uint8Array(iv.length + encryptedBytes.length + hmac.length);
                    result.set(iv);
                    result.set(encryptedBytes, iv.length);
                    result.set(hmac, iv.length + encryptedBytes.length);
                    return [2 /*return*/, bytesToHex(result)];
                case 3:
                    error_2 = _a.sent();
                    console.error('Encryption error:', error_2);
                    throw new Error('Failed to encrypt data');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Decrypt data using AES-256-CTR with HMAC verification
 *
 * @param encryptedData Hex-encoded encrypted data (format: IV + EncryptedData + HMAC)
 * @param key Hex-encoded encryption key (32 bytes)
 * @returns Plain text data
 * @throws Error if HMAC verification fails (tampered data)
 */
function decrypt(encryptedData, key) {
    return __awaiter(this, void 0, void 0, function () {
        var combined, hmacLength, iv, encryptedBytes, storedHmac, keyBytes, dataToVerify, calculatedHmac, mismatch, i, aesCtr, decryptedBytes, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    combined = hexToBytes(encryptedData);
                    hmacLength = 32;
                    iv = combined.slice(0, IV_LENGTH);
                    encryptedBytes = combined.slice(IV_LENGTH, -hmacLength);
                    storedHmac = combined.slice(-hmacLength);
                    keyBytes = hexToBytes(key);
                    dataToVerify = combined.slice(0, -hmacLength);
                    return [4 /*yield*/, hmacSha256(keyBytes, dataToVerify)];
                case 1:
                    calculatedHmac = _a.sent();
                    mismatch = 0;
                    for (i = 0; i < hmacLength; i++) {
                        mismatch |= storedHmac[i] ^ calculatedHmac[i];
                    }
                    if (mismatch !== 0) {
                        throw new Error('Authentication failed - data may have been tampered with');
                    }
                    aesCtr = new aes.ModeOfOperation.ctr(keyBytes, Array.from(iv));
                    decryptedBytes = aesCtr.decrypt(encryptedBytes);
                    return [2 /*return*/, bytesToString(decryptedBytes)];
                case 2:
                    error_3 = _a.sent();
                    console.error('Decryption error:', error_3);
                    throw new Error('Failed to decrypt data');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Hash password for verification (not for encryption)
 * Uses PBKDF2 with 100k iterations
 */
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, hash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, generateSalt()];
                case 1:
                    salt = _a.sent();
                    return [4 /*yield*/, deriveKeyFromPassword(password, salt)];
                case 2:
                    hash = _a.sent();
                    // Store salt + hash together (separated by :)
                    return [2 /*return*/, "".concat(salt, ":").concat(hash)];
            }
        });
    });
}
/**
 * Verify password against stored hash
 */
function verifyPassword(password, storedHash) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, salt, expectedHash, actualHash, mismatch, i, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = storedHash.split(':'), salt = _a[0], expectedHash = _a[1];
                    if (!salt || !expectedHash)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, deriveKeyFromPassword(password, salt)];
                case 1:
                    actualHash = _b.sent();
                    // Constant-time comparison
                    if (actualHash.length !== expectedHash.length)
                        return [2 /*return*/, false];
                    mismatch = 0;
                    for (i = 0; i < actualHash.length; i++) {
                        mismatch |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
                    }
                    return [2 /*return*/, mismatch === 0];
                case 2:
                    error_4 = _b.sent();
                    console.error('Password verification error:', error_4);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get or create salt for user
 * Salt is stored in SecureStore
 */
function getUserSalt() {
    return __awaiter(this, void 0, void 0, function () {
        var salt, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, SecureStore.getItemAsync('vault_salt')];
                case 1:
                    salt = _a.sent();
                    if (!!salt) return [3 /*break*/, 4];
                    return [4 /*yield*/, generateSalt()];
                case 2:
                    salt = _a.sent();
                    return [4 /*yield*/, SecureStore.setItemAsync('vault_salt', salt)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, salt];
                case 5:
                    error_5 = _a.sent();
                    console.error('Failed to get/create salt:', error_5);
                    throw new Error('Failed to initialize encryption');
                case 6: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// Helper Functions
// ============================================================================
function stringToBytes(str) {
    var encoder = new TextEncoder();
    return encoder.encode(str);
}
function bytesToString(bytes) {
    var decoder = new TextDecoder();
    return decoder.decode(bytes);
}
function bytesToHex(bytes) {
    return Array.from(bytes)
        .map(function (b) { return b.toString(16).padStart(2, '0'); })
        .join('');
}
function hexToBytes(hex) {
    var bytes = new Uint8Array(hex.length / 2);
    for (var i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}
// ============================================================================
// Testing Utilities
// ============================================================================
/**
 * Test encryption/decryption cycle
 */
function testEncryption() {
    return __awaiter(this, void 0, void 0, function () {
        var testData, password, salt, startTime, key, keyTime, encrypted, decrypted, success, tampered, error_6, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    testData = 'Hello, World! 🔐 This is a test of AES-256-CTR encryption.';
                    password = 'super-secret-password-123!';
                    console.log('🔐 Testing encryption...');
                    console.log('Original:', testData);
                    return [4 /*yield*/, generateSalt()];
                case 1:
                    salt = _a.sent();
                    console.log('✓ Salt generated:', salt.substring(0, 20) + '...');
                    // Derive key (PBKDF2 with 100k iterations)
                    console.log('⏳ Deriving key (100k iterations)...');
                    startTime = Date.now();
                    return [4 /*yield*/, deriveKeyFromPassword(password, salt)];
                case 2:
                    key = _a.sent();
                    keyTime = Date.now() - startTime;
                    console.log("\u2713 Key derived in ".concat(keyTime, "ms:"), key.substring(0, 20) + '...');
                    return [4 /*yield*/, encrypt(testData, key)];
                case 3:
                    encrypted = _a.sent();
                    console.log('✓ Encrypted:', encrypted.substring(0, 40) + '...');
                    console.log('  Length:', encrypted.length, 'chars (hex)');
                    return [4 /*yield*/, decrypt(encrypted, key)];
                case 4:
                    decrypted = _a.sent();
                    console.log('✓ Decrypted:', decrypted);
                    success = decrypted === testData;
                    console.log(success ? '✅ Test PASSED' : '❌ Test FAILED');
                    // Test tampered data detection
                    console.log('\n🔒 Testing tamper detection...');
                    tampered = encrypted.substring(0, encrypted.length - 2) + 'FF';
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, decrypt(tampered, key)];
                case 6:
                    _a.sent();
                    console.log('❌ Tamper detection FAILED - should have thrown error');
                    return [2 /*return*/, false];
                case 7:
                    error_6 = _a.sent();
                    if (error_6.message.includes('Authentication failed')) {
                        console.log('✅ Tamper detection PASSED');
                    }
                    else {
                        console.log('❌ Unexpected error:', error_6.message);
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, success];
                case 9:
                    error_7 = _a.sent();
                    console.error('❌ Test FAILED:', error_7);
                    return [2 /*return*/, false];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Test password hashing
 */
function testPasswordHashing() {
    return __awaiter(this, void 0, void 0, function () {
        var password, startTime, hash, hashTime, validStart, validResult, validTime, invalidResult, success, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    password = 'my-secure-password-456!';
                    console.log('🔑 Testing password hashing...');
                    // Hash password
                    console.log('⏳ Hashing password (100k iterations)...');
                    startTime = Date.now();
                    return [4 /*yield*/, hashPassword(password)];
                case 1:
                    hash = _a.sent();
                    hashTime = Date.now() - startTime;
                    console.log("\u2713 Hash generated in ".concat(hashTime, "ms:"), hash.substring(0, 40) + '...');
                    validStart = Date.now();
                    return [4 /*yield*/, verifyPassword(password, hash)];
                case 2:
                    validResult = _a.sent();
                    validTime = Date.now() - validStart;
                    console.log("\u2713 Verify (correct) in ".concat(validTime, "ms:"), validResult);
                    return [4 /*yield*/, verifyPassword('wrong-password', hash)];
                case 3:
                    invalidResult = _a.sent();
                    console.log('✓ Verify (wrong):', invalidResult);
                    success = validResult && !invalidResult;
                    console.log(success ? '✅ Test PASSED' : '❌ Test FAILED');
                    return [2 /*return*/, success];
                case 4:
                    error_8 = _a.sent();
                    console.error('❌ Test FAILED:', error_8);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Performance benchmark
 */
function benchmarkCrypto() {
    return __awaiter(this, void 0, void 0, function () {
        var password, salt, keyStart, key, keyTime, sizes, _i, sizes_1, size, testData, encStart, encrypted, encTime, decStart, decTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n📊 Performance Benchmark\n');
                    password = 'benchmark-password';
                    return [4 /*yield*/, generateSalt()];
                case 1:
                    salt = _a.sent();
                    // Benchmark key derivation
                    console.log('1. Key Derivation (PBKDF2, 100k iterations):');
                    keyStart = Date.now();
                    return [4 /*yield*/, deriveKeyFromPassword(password, salt)];
                case 2:
                    key = _a.sent();
                    keyTime = Date.now() - keyStart;
                    console.log("   ".concat(keyTime, "ms\n"));
                    sizes = [100, 1000, 10000];
                    _i = 0, sizes_1 = sizes;
                    _a.label = 3;
                case 3:
                    if (!(_i < sizes_1.length)) return [3 /*break*/, 7];
                    size = sizes_1[_i];
                    testData = 'x'.repeat(size);
                    encStart = Date.now();
                    return [4 /*yield*/, encrypt(testData, key)];
                case 4:
                    encrypted = _a.sent();
                    encTime = Date.now() - encStart;
                    decStart = Date.now();
                    return [4 /*yield*/, decrypt(encrypted, key)];
                case 5:
                    _a.sent();
                    decTime = Date.now() - decStart;
                    console.log("2. Encryption (".concat(size, " bytes):"));
                    console.log("   Encrypt: ".concat(encTime, "ms"));
                    console.log("   Decrypt: ".concat(decTime, "ms"));
                    console.log("   Total: ".concat(encTime + decTime, "ms\n"));
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7: return [2 /*return*/];
            }
        });
    });
}
