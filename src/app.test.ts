import crypto from 'node:crypto';
import type http from 'node:http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from './app';
import { API_KEY } from './constants';

const PORT = process.env.PORT || 3008;

describe('HMAC Example', () => {
	let server: http.Server;

	beforeAll(() => {
		server = app.listen(PORT, () => {
			console.log(`Test server running on port ${PORT}`);
		});
	});

	afterAll(() => {
		server.close();
	});

	it('should generate HMAC and then verify webhook using that HMAC', async () => {
		// this is the HMAC messages will use when sending webhooks
		const generateHmacResponse = await request(app)
			.post('/generate-hmac')
			.set('x-api-key', API_KEY)
			.send();

		expect(generateHmacResponse.status).toBe(200);
		const { hmac } = generateHmacResponse.body;

		const payload = { data: 'test' };

		// calculate the payload HMAC for the payload
		const payloadHmac = crypto
			.createHmac('sha256', hmac)
			.update(JSON.stringify(payload))
			.digest('hex');

		// send as the header when sending the webhook
		const sendWebhookResponse = await request(app)
			.post('/webhook-receiver')
			.set('Content-Type', 'application/json')
			.set('X-HMAC-Signature', payloadHmac)
			.send({
				payload,
			});

		expect(sendWebhookResponse.status).toBe(200);
		expect(sendWebhookResponse.body).toHaveProperty('success', true);
	});

	it('sender uses different HMAC', async () => {
		// this is the HMAC messages will use when sending webhooks
		const generateHmacResponse = await request(app)
			.post('/generate-hmac')
			.set('x-api-key', API_KEY)
			.send();

		expect(generateHmacResponse.status).toBe(200);

		const payload = { data: 'test' };

		// use incorrect HMAC for the payload
		const payloadHmac = crypto
			.createHmac('sha256', 'abc')
			.update(JSON.stringify(payload))
			.digest('hex');

		// send as the header when sending the webhook
		const sendWebhookResponse = await request(app)
			.post('/webhook-receiver')
			.set('Content-Type', 'application/json')
			.set('X-HMAC-Signature', payloadHmac)
			.send({
				payload,
			});

		expect(sendWebhookResponse.status).toBe(400);
	});
});
