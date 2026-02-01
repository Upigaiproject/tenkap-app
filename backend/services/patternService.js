/**
 * TENKAP Pattern Analysis Service (The Brain)
 * Handles behavioral pattern extraction from user data.
 */

class PatternService {
    constructor(db) {
        this.db = db;
    }

    /**
     * Phase 2: Analyze Time Patterns
     * Extracts preferred days and hours for activities.
     */
    async analyzeTimePatterns(userId) {
        const checkIns = await this.db.getUserCheckIns(userId);
        if (!checkIns || checkIns.length < 5) {
            return null; // Not enough data
        }

        console.log(`🧠 Analyzing time patterns for ${userId} (${checkIns.length} check-ins)`);

        // TODO: Implement frequency analysis
        return {
            preferredDays: [],
            preferredHours: []
        };
    }

    /**
     * Phase 2: Location Clustering
     * Uses K-Means to find favorite spots.
     */
    async analyzeLocations(userId) {
        // TODO: Implement K-Means
        return [];
    }

    /**
     * Phase 2: Sequential Patterns
     * "After X, usually goes to Y" (e.g., Cafe -> Park)
     */
    async analyzeSequences(userId) {
        const checkIns = (await this.db.getUserCheckIns(userId))
            .sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime));

        if (checkIns.length < 2) return [];

        const transitions = new Map(); // "kafe->acik" => count
        const categoryCounts = new Map(); // "kafe" => count

        for (let i = 0; i < checkIns.length - 1; i++) {
            const current = checkIns[i];
            const next = checkIns[i + 1];

            // Increment category count
            categoryCounts.set(current.category, (categoryCounts.get(current.category) || 0) + 1);

            // Check if sequential (within 3 hours)
            const hoursDiff = (new Date(next.entryTime) - new Date(current.entryTime)) / (1000 * 60 * 60);

            if (hoursDiff <= 3) {
                const key = `${current.category}->${next.category}`;
                transitions.set(key, (transitions.get(key) || 0) + 1);
            }
        }

        // Calculate Probabilities
        const patterns = [];
        for (const [key, count] of transitions.entries()) {
            const [from, to] = key.split('->');
            const totalFrom = categoryCounts.get(from) || 1;
            const probability = count / totalFrom;

            if (probability >= 0.25) { // >25% chance
                patterns.push({ from, to, probability, count });
            }
        }

        return patterns.sort((a, b) => b.probability - a.probability);
    }

    /**
     * Master method to run all analyses
     */
    async refreshUserPatterns(userId) {
        const timePatterns = await this.analyzeTimePatterns(userId);
        // const locationPatterns = await this.analyzeLocations(userId);

        if (timePatterns) {
            await this.db.saveUserPattern(userId, {
                timePatterns,
                // locationPatterns
            });
            return true;
        }
        return false;
    }
}

module.exports = PatternService;
