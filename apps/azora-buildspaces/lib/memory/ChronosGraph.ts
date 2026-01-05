// ChronosGraph: The "Temporal Brain" of Sankofa Memory
// Tracks evolution of entities (Projects, Tokens, Nodes) over time

export interface ChronosEpisode {
    id: string;
    entityId: string;
    type: string;
    data: any;
    validAt: Date;
    invalidAt?: Date;
    relation?: {
        type: string;
        targetId: string;
    };
}

export class ChronosGraph {
    private episodes: ChronosEpisode[] = [];

    /**
     * Insert a new episode into the graph.
     * If an episode for the same entity already exists without an invalidAt date,
     * it marks it as superseded by the new one.
     */
    insertEpisode(entityId: string, type: string, data: any, relation?: { type: string, targetId: string }) {
        const now = new Date();

        // 1. Find the current active episode for this entity
        const activeEpisode = this.episodes.find(e => e.entityId === entityId && !e.invalidAt);

        if (activeEpisode) {
            activeEpisode.invalidAt = now;
        }

        // 2. Create the new episode
        const newEpisode: ChronosEpisode = {
            id: `ep-${Math.random().toString(36).substr(2, 9)}`,
            entityId,
            type,
            data,
            validAt: now,
            relation
        };

        this.episodes.push(newEpisode);
        console.log(`[Chronos] New episode for ${entityId} recorded at ${now.toISOString()}`);
        return newEpisode;
    }

    /**
     * Query the state of an entity at a specific point in time.
     */
    queryAt(entityId: string, timestamp: Date): ChronosEpisode | undefined {
        return this.episodes.find(e =>
            e.entityId === entityId &&
            e.validAt <= timestamp &&
            (!e.invalidAt || e.invalidAt > timestamp)
        );
    }

    /**
     * Get the evolution history of an entity.
     */
    getHistory(entityId: string): ChronosEpisode[] {
        return this.episodes
            .filter(e => e.entityId === entityId)
            .sort((a, b) => a.validAt.getTime() - b.validAt.getTime());
    }

    /**
     * Find relations active at a specific time.
     */
    findRelations(type: string, timestamp: Date = new Date()) {
        return this.episodes.filter(e =>
            e.relation?.type === type &&
            e.validAt <= timestamp &&
            (!e.invalidAt || e.invalidAt > timestamp)
        );
    }
}

// Usage Example:
// const chronos = new ChronosGraph();
// chronos.insertEpisode("color-primary", "DESIGN_TOKEN", { hex: "#d4af37" });
// ... later ...
// chronos.insertEpisode("color-primary", "DESIGN_TOKEN", { hex: "#800000" });
// const oldState = chronos.queryAt("color-primary", lastWeek);
