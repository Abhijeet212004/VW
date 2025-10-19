import { Router } from 'express';
import { slotDetailsController } from './slot_details.controller';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: ParkingSlot
 *     description: Individual parking slots and CV events
 */

/**
 * @openapi
 * /api/slot-details/event:
 *   post:
 *     tags:
 *       - ParkingSlot
 *     summary: Receive CV event for a specific slot
 *     description: Receives a CV event from the computer vision server (via websocket or proxy) and stores a SlotCVLog and updates slot status accordingly.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slotId:
 *                 type: string
 *                 description: ID of the ParkingSlot (preferred). If provided by the CV server and the slot doesn't exist, this id will be used when creating the slot.
 *               parkingSpotId:
 *                 type: string
 *                 description: ParkingSpot id where the slot belongs
 *               slotNumber:
 *                 type: integer
 *                 description: Slot number within the parking spot
 *               eventType:
 *                 type: string
 *                 enum: [ENTRY, EXIT, OVERSTAY_ALERT, SLOT_UPDATE]
 *               status:
 *                 type: string
 *                 enum: [FREE, OCCUPIED, BLOCKED]
 *                 description: Status as detected by the CV server. Required when creating a new slot.
 *             required:
 *               - eventType
 *     responses:
 *       '201':
 *         description: Event processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.post('/event', slotDetailsController.receiveEvent);

router.get('/health', slotDetailsController.health);

export default router;
