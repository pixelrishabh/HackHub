const Certificate = require('../models/Certificate');
const User = require('../models/User');
const crypto = require('crypto');

async function getMyCertificates(req, res) {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let certs;
    if (userRole === 'organizer') {
      certs = await Certificate.find().populate('userId', 'name email role').sort({ createdAt: -1 });
    } else {
      certs = await Certificate.find({ userId }).sort({ createdAt: -1 });
    }

    const formatted = certs.map((c) => {
      const json = c.toJSON();
      if (c.userId && c.userId.name) {
        json.recipient_name = c.userId.name;
        json.recipient_email = c.userId.email;
      }
      return json;
    });

    return res.status(200).json({ certificates: formatted });
  } catch (error) {
    console.error('[CertificateController] getMyCertificates Error:', error);
    return res.status(500).json({ error: 'Failed to fetch certificates.' });
  }
}

async function issueCertificate(req, res) {
  try {
    const { user_id, userId, title, tier, recipient_name } = req.body;
    let targetUserId = req.user._id;

    if (user_id || userId) {
      const candidateId = user_id || userId;
      if (mongoose.Types.ObjectId.isValid(candidateId)) {
        targetUserId = candidateId;
      }
    }

    const certTitle = title || tier || 'HackHub AI Championship Winner';
    const hash = '0x' + crypto.createHash('sha256').update(`${targetUserId}-${certTitle}-${Date.now()}-${Math.random()}`).digest('hex').substring(0, 16);

    const newCert = await Certificate.create({
      userId: targetUserId,
      title: certTitle,
      hash,
      verified: true,
    });

    return res.status(201).json({
      message: 'Certificate issued successfully.',
      certificate: newCert.toJSON(),
    });
  } catch (error) {
    console.error('[CertificateController] issueCertificate Error:', error);
    return res.status(500).json({ error: 'Failed to issue certificate.' });
  }
}

async function verifyCertificate(req, res) {
  try {
    const { hash } = req.params;
    const cert = await Certificate.findOne({ hash }).populate('userId', 'name email role');

    if (!cert) {
      return res.status(404).json({ verified: false, error: 'Invalid or unverified certificate hash credential.' });
    }

    return res.status(200).json({
      verified: true,
      certificate: {
        id: cert._id.toString(),
        title: cert.title,
        recipient_name: cert.userId ? cert.userId.name : 'HackHub Participant',
        issued_at: cert.issuedAt,
        hash: cert.hash,
        issuer: 'HackHub AI Platform',
      },
    });
  } catch (error) {
    console.error('[CertificateController] verifyCertificate Error:', error);
    return res.status(500).json({ error: 'Failed to verify certificate.' });
  }
}

module.exports = {
  getMyCertificates,
  issueCertificate,
  verifyCertificate,
};
