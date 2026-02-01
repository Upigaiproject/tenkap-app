const express = require('express');
const router = express.Router();

module.exports = (io, heatMapService) => {

    // Socket.io events
    io.on('connection', (socket) => {

        // Subscribe to heat map updates
        socket.on('heatmap:subscribe', (filters) => {
            console.log('📊 Heat map subscription:', socket.id, filters);

            heatMapService.subscribe(socket.id, filters);

            // Send initial data immediately
            const data = heatMapService.generateHeatMapData(filters);
            socket.emit('heatmap:update', data);
        });

        // Unsubscribe on disconnect
        socket.on('disconnect', () => {
            heatMapService.unsubscribe(socket.id);
        });
    });

    // Broadcast updates every 5 seconds
    setInterval(() => {
        heatMapService.broadcastUpdate(io);
    }, 5000);

    // REST API endpoints

    // GET /api/heatmap/data - Get heat map data
    router.get('/data', (req, res) => {
        try {
            const { category = 'all', timeRange = 'live' } = req.query;
            const data = heatMapService.generateHeatMapData({ category, timeRange });
            res.json(data);
        } catch (error) {
            console.error('Failed to generate heat map data:', error);
            res.status(500).json({ error: 'Failed to generate heat map data' });
        }
    });

    // GET /api/heatmap/stats - Get heat map statistics
    router.get('/stats', (req, res) => {
        try {
            const stats = heatMapService.getStatistics();
            res.json(stats);
        } catch (error) {
            console.error('Failed to get heat map stats:', error);
            res.status(500).json({ error: 'Failed to get heat map stats' });
        }
    });

    return router;
};
