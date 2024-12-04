import mongoose from "mongoose";
import { IUser, User } from "../../auth/models/user.model";
import { Logs, ILogs } from "../models/log.model";
import { ILogActionPayload } from "../types/logs.types";
import { appEmitter } from "../../globals/events";
import { LOG_EVENTS } from "../events/log.event";

export async function logAction(
     payload: ILogActionPayload
): Promise<void> {
     try {
          let user: IUser;
          let description: string;
          if (payload.user_id) {

               user = await User.findById(payload.user_id).session(payload.transaction).exec();
          description = `${user.first_name} ${user.last_name}(${user.role}) ${payload.action}; ${payload.details}`;

          } else {
               description = `${payload.name} ${payload.action}; ${payload.details}`;
          }

          const data = {
               performedBy: payload.user_id ? user.id : null,
               action: payload.action,
               description: description,
               status: payload.status,
               name: payload.name ? payload.name : "",
               error_message: payload.error_message ? payload.error_message : "",
          };

          // Log the action
          if (payload.transaction) {
               await Logs.create([data], { session: payload.transaction });
          } else await Logs.create([data]);
     } catch (error) {
          console.error('Error logging action:', error);
          throw error;
     }
}

appEmitter.on(LOG_EVENTS.LOG_ACTION, async (data: ILogActionPayload) => {
     try {
          await logAction({
               status: data.status,
               action: data.action,
               name: data.name,
               user_id: data.user_id,
               details: data.details,
               transaction: data.transaction,
               error_message: data.error_message,
          })
          
     } catch (error) {
          console.error("Error logging action:", error);
        }
})