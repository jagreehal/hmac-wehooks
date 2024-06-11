# HMAC Webhooks Example

This repository contains examples of generating and verifying HMAC signatures to secure webhooks.

```mermaid
sequenceDiagram
    participant Client
    participant Server

    %% Generate HMAC process
    Client->>Server: POST /generate-hmac (API_KEY)
    Server->>Client: Return HMAC (200 OK)
    Server->>Client: POST /webhook-receiver (payload, HMAC in header)
    Note over Client,Server: Validate payload body HMAC with received HMAC header
    Client->>Client: Validate


```

It uses [Vitest](https://vitest.dev/) for testing and [Supertest](https://github.com/visionmedia/supertest) to simulate HTTP requests.

## Getting Started

Install using bun

```bash
bun install
```

## Run the tests

```bash
bun test
```
