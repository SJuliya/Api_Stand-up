import {sendData, sendError} from "./send.js";
import {CLIENTS} from "../index.js";
import fs from "node:fs/promises";
import {readRequestBody} from "./helpers.js";

export const handleUpdateClient = async (req, res, ticketNumber) => {
    try {
        const body = await readRequestBody(req);
        const updateDataClient = JSON.parse(body);

        if (!updateDataClient.fullName || !updateDataClient.phone || !updateDataClient.ticketNumber || !updateDataClient.booking) {
            sendError(res, 400, "Неверные данные клиента");
            return;
        }

        if (updateDataClient.booking &&
            (!updateDataClient.booking.length || !Array.isArray(updateDataClient.booking) ||
                !updateDataClient.booking.every((item) => item.comedian && item.time))
        ) {
            sendError(res, 400, "Неверно заполнены поля бронирования");
            return;
        }

        const clientData = await fs.readFile(CLIENTS, 'utf-8');
        const clients = JSON.parse(clientData);

        const clientIndex = clients.findIndex(c => c.ticketNumber === ticketNumber);

        if (clientIndex === -1) {
            sendError(res, 404, "Клиент с данным номером билета не найден");
            return;
        }

        clients[clientIndex] = {
            ...clients[clientIndex], ...updateDataClient,
        };

        await fs.writeFile(CLIENTS, JSON.stringify(clients));
        sendData(res, clients[clientIndex]);
    } catch (error) {
        console.error(`error: ${error}`);
        sendError(res, 500, "Ошибка сервера при обновлении данных");
    }
};