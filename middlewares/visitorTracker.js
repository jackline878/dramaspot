const { Visitor } = require('../models');
const geoip = require('geoip-lite');

const axios = require('axios');

async function getLocation(ip) {
    if (ip === '::1' || ip === '127.0.0.1') return 'Localhost';

    try {
        const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        const { city, region, country_name } = response.data;
        return `${city || ''}, ${region || ''}, ${country_name || ''}`.trim().replace(/^,|,$/g, '');
    } catch (err) {
        console.error('Geolocation error:', err.message);
        return 'Unknown';
    }
}

function getClientIp(req) {
    const xForwardedFor = req.headers['x-forwarded-for'];
    const ip = xForwardedFor
        ? xForwardedFor.split(',')[0].trim()
        : req.socket.remoteAddress;
    return ip;
}

module.exports = async (req, res, next) => {
    try {
        const ip = getClientIp(req);

        const userAgent = req.get('User-Agent') || 'unknown';
        const page = req.path;
        const visitDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        res.on('finish', async () => {
            const location = await getLocation(ip);
            const existing = await Visitor.findOne({ where: { ip, page, visitDate } });

            if (existing) {
                existing.frequency += 1;
                await existing.save();
            } else {
                await Visitor.create({ ip, userAgent, location, page, visitDate, frequency: 1 });
            }
        })
    } catch (error) {
        console.error('Visitor tracking failed:', error.message);
    }

    next();
};
