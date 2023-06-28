import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "/getPluginId";
const ID = "CWS.OBMC";

export function setupContextMenu() {
  OBR.contextMenu.create({
    id: getPluginId("menu"),
    icons: [
      {
        icon: "/OBMC_cb.png",
        label: "Add MC",
        filter: {
          every: [{ key: "layer", value: "CHARACTER" }],
		  permissions: ["UPDATE"],
        },
      },
    ],
 onClick(context,elementId) 
	{

        OBR.popover.open({
		id: getPluginId("color-picker"),
        url: "/pop.html",
        height:100,
        width: 300,
        anchorElementId: elementId,
      });


},
  });
}