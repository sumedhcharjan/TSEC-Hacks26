const axios = require('axios');
require('dotenv').config();

const FINTERNET_API_KEY = process.env.FINTERNET_API_KEY;
const FINTERNET_BASE_URL = process.env.FINTERNET_BASE_URL;

const apiClient = axios.create({
    baseURL: FINTERNET_BASE_URL,
    headers: {
        'X-API-Key': FINTERNET_API_KEY,
        'Content-Type': 'application/json'
    }
});

/**
 * Service to handle Finternet Programmable Escrow API calls
 */
const FinternetService = {
    /**
     * Creates a new Payment Intent (DVP - Delivery vs Payment)
     * @param {Object} data - Amount, currency, description, etc.
     */
    createPaymentIntent: async (data) => {
        try {
            console.log(`📡 [Finternet API] POST /api/v1/payment-intents | Amount: ${data.amount}`);
            const response = await apiClient.post('/api/v1/payment-intents', {
                amount: data.amount,
                currency: data.currency || 'USD',
                type: 'DELIVERY_VS_PAYMENT',
                settlementMethod: 'OFF_RAMP_MOCK',
                settlementDestination: data.settlementDestination || 'city_treasury_bank',
                description: data.description || 'Infrastructure Work Order',
                metadata: {
                    releaseType: 'MILESTONE_LOCKED',
                    ...data.metadata
                }
            });
            console.log(`📥 [Finternet API] Response: ${response.data.data.id} - ${response.data.data.status}`);
            return response.data;
        } catch (error) {
            console.error('❌ [Finternet API] Create Intent Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Fetches escrow details associated with a payment intent
     * @param {string} intentId 
     */
    getEscrowDetails: async (intentId) => {
        try {
            console.log(`📡 [Finternet API] GET /api/v1/payment-intents/${intentId}/escrow`);
            const response = await apiClient.get(`/api/v1/payment-intents/${intentId}/escrow`);
            return response.data;
        } catch (error) {
            console.error('❌ [Finternet API] Get Escrow Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Creates milestones for an existing payment intent escrow
     * @param {string} intentId 
     * @param {Object} milestone - { milestoneIndex, description, amount }
     */
    createMilestone: async (intentId, milestone) => {
        try {
            console.log(`📡 [Finternet API] POST .../milestones | Index: ${milestone.milestoneIndex}`);
            const response = await apiClient.post(`/api/v1/payment-intents/${intentId}/escrow/milestones`, {
                milestoneIndex: milestone.milestoneIndex,
                description: milestone.description,
                amount: milestone.amount
            });
            return response.data;
        } catch (error) {
            console.error('❌ [Finternet API] Create Milestone Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Submits delivery proof for a payment intent
     * @param {string} intentId 
     * @param {Object} proofData - { proofHash, proofURI, submittedBy }
     */
    submitProof: async (intentId, proofData) => {
        try {
            console.log(`📡 [Finternet API] POST .../delivery-proof | Intent: ${intentId}`);
            const response = await apiClient.post(`/api/v1/payment-intents/${intentId}/escrow/delivery-proof`, {
                proofHash: proofData.proofHash || '0xdefault_proof_hash',
                proofURI: proofData.proofURI || 'https://city.gov/proofs/default',
                submittedBy: proofData.submittedBy
            });
            console.log(`📥 [Finternet API] Proof Submitted! Response ID: ${response.data.id}`);
            return response.data;
        } catch (error) {
            console.error('❌ [Finternet API] Submit Proof Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Executes settlement for a specific milestone
     * @param {string} intentId 
     * @param {number} milestoneIndex 
     */
    settleMilestone: async (intentId, milestoneIndex) => {
        try {
            console.log(`📡 [Finternet API] POST .../settlement | Intent: ${intentId}, Milestone: ${milestoneIndex}`);
            const response = await apiClient.post(`/api/v1/payment-intents/${intentId}/escrow/settlement`, {
                milestoneIndex: milestoneIndex
            });
            console.log(`📥 [Finternet API] Settlement Result: ${response.data.status || 'SUCCESS'}`);
            return response.data;
        } catch (error) {
            console.error('❌ [Finternet API] Settle Milestone Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Fetches account ledger entries for financial auditing
     */
    getLedgerEntries: async (limit = 20, offset = 0) => {
        try {
            console.log(`📡 [Finternet API] GET .../ledger-entries | Limit: ${limit}`);
            const response = await apiClient.get('/api/v1/payment-intents/account/ledger-entries', {
                params: { limit, offset }
            });
            return response.data;
        } catch (error) {
            console.error('❌ [Finternet API] Get Ledger Error:', error.response?.data || error.message);
            throw error;
        }
    }
};

module.exports = FinternetService;
