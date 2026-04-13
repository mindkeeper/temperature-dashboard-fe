# Device Config Modal - Endpoint Analysis & Fix

## Summary

The **Add Device Modal** (Step 1: Gateway Provisioning) was using the **wrong endpoint** to register a new gateway. It called `PUT /devices/{imei}/connect` but should call `POST /devices/gateways`. Additionally, there was no way to add sensors to an existing gateway.

**Both issues have been fixed.**

---

## Issue 1: Wrong Endpoint for Gateway Creation (FIXED)

### What the frontend did (WRONG)

In `add-device-modal.tsx`, when the user submitted the gateway form:

```ts
connectGatewayMutation.mutate(values.imei, { ... });
```

This called `useConnectGateway()` → `deviceConfigService.connectGateway(id)` → **`PUT /devices/{imei}/connect`**

### Why this was wrong

1. **Wrong endpoint purpose**: `PUT /devices/:id/connect` marks an _existing device_ as ready for provisioning — not create a new gateway.
2. **Wrong identifier**: expects a **device UUID**, but the frontend passed the **IMEI string**.
3. **Missing request body**: `POST /devices/gateways` expects `{ imei, warehouseId }` — the old call sent no body.

### Fix applied

- Added `createGateway()` method to `device-config.service.ts` → `POST /devices/gateways`
- Created `useCreateGateway` hook
- Updated `add-device-modal.tsx` to use `useCreateGateway` with `{ imei, warehouseId }` payload

---

## Issue 2: No Way to Add Sensors to Existing Gateway (FIXED)

### Problem

The only way to add a sensor was through the "Add New Device" modal, which required creating a new gateway first. There was no flow for adding sensors to gateways already in the system.

### Fix applied

- Created `AddSensorModal` component — a standalone modal that takes `gatewayId`, `gatewayImei`, and `warehouseId` as props
- Added "Add Sensor" button to each gateway row in the device table (visible when the row is expanded)
- Added `warehouseId` to the gateway select in the backend's `findAll` query so the frontend has the warehouse context

---

## Files Changed

### Frontend (`temperature-dashboard-fe`)

| File                                | Change                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `types/device-config.types.ts`      | Added `GatewayResponse` interface; added `warehouseId` to gateway type in `DeviceListItem` |
| `services/device-config.service.ts` | Added `createGateway()` method calling `POST /devices/gateways`                            |
| `hooks/use-create-gateway.ts`       | **New file** — hook wrapping `createGateway` service call                                  |
| `hooks/index.ts`                    | Exported `useCreateGateway`                                                                |
| `components/add-device-modal.tsx`   | Replaced `useConnectGateway` with `useCreateGateway`; sends `{ imei, warehouseId }`        |
| `components/add-sensor-modal.tsx`   | **New file** — modal for adding sensor to existing gateway                                 |
| `components/device-table.tsx`       | Added "Add Sensor" button on gateway rows                                                  |

### Backend (`temperature-dashboard`)

| File                                 | Change                                                   |
| ------------------------------------ | -------------------------------------------------------- |
| `modules/devices/devices.service.ts` | Added `warehouseId: true` to gateway select in `findAll` |

---

## Endpoint Reference (Backend)

| Method  | Path                            | Controller                               | Purpose                              |
| ------- | ------------------------------- | ---------------------------------------- | ------------------------------------ |
| `POST`  | `/api/v1/devices`               | `DevicesController.create()`             | Create new device (sensor)           |
| `GET`   | `/api/v1/devices`               | `DevicesController.findAll()`            | List devices with filters            |
| `PATCH` | `/api/v1/devices/:id/status`    | `DevicesController.toggleStatus()`       | Activate/deactivate device           |
| `PUT`   | `/api/v1/devices/:id/connect`   | `DevicesController.connectGateway()`     | Mark device READY_FOR_PROVISIONING   |
| `POST`  | `/api/v1/devices/gateways`      | `DevicesController.createGateway()`      | Register new gateway by IMEI         |
| `POST`  | `/api/v1/sensors/:id/configure` | `JobsController.configureSensor()`       | Remote sensor configuration via MQTT |
| `GET`   | `/api/v1/jobs/:jobId`           | `JobsController.getJobStatus()`          | Poll configuration job status        |
| `GET`   | `/api/v1/provision/:imei`       | `ProvisionController.provisionGateway()` | Zero-touch provisioning (public)     |
