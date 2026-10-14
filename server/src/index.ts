import { env } from "./env.js";
import { createApp } from "./app.js";

createApp().listen(env.port, () => console.log(`InvenTrack API: http://localhost:${env.port}`));
