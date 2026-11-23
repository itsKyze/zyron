import { createFileRoute } from "@tanstack/react-router";
import OpenBotView from "~/components/openbot/OpenBotView";

export const Route = createFileRoute("/_chat/openbot/")({
  component: OpenBotView,
});
