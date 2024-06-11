import crypto from 'node:crypto';
import express, { type Request, type Response } from 'express';

const SECRET_KEY = 'test-secret';
import { API_KEY } from './constants';

const app = express();
app.use(express.json());

let hmac: string;
app.post('/generate-hmac', (req, res) => {
	if (req.headers['x-api-key'] !== API_KEY) {
		return res.status(403).json({ error: 'Forbidden' });
	}

	hmac = crypto.createHmac('sha256', SECRET_KEY).update(API_KEY).digest('hex');
	return res.json({ hmac });
});

// Webhook receiver endpoint
app.post('/webhook-receiver', (req: Request, res: Response) => {
	const receivedHmac = req.headers['x-hmac-signature'];
	const calculatedHmac = crypto
		.createHmac('sha256', hmac)
		.update(JSON.stringify(req.body.payload))
		.digest('hex');

	if (receivedHmac !== calculatedHmac) {
		return res.status(400).json({ error: 'Invalid HMAC signature' });
	}
	return res.json({ success: true });
});

export { app };
