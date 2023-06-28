  import type from "@owlbear-rodeo/sdk";
  import OBR, { buildText } from "@owlbear-rodeo/sdk";
  import {getPluginId} from "./getPluginId";
  import { isImage, isText} from "@owlbear-rodeo/sdk";

 OBR.onReady(async() => {

	 // Setup the document with the html button elements
  	document.getElementById("TxtCtrls").innerHTML = `
	
	<label for="PList" style="color:white">Players</label>
	<br>
	
    <select id="PList" size="6" style="width: 200px;">
      <option>Everyone</option>
    </select>
	
	<br>
	
	<textarea
	name="message"
	id="message"	
	type="text"
	maxlength="256"
	align="left"
	style="width: 200px;"
	rows="3">
	</textarea>
	
	<div class="buttons">
    <button id="Send" style="width: 200px;">Send Message</button>
   </div>
  `;
   
	  // Attach click listeners to +/- buttons
     document.getElementById("Send").addEventListener("click", writemsg);
	
	//Populate initial Player list in html select box
	getPlayers(document.querySelector("#PList"));

	//Update Player list in html select box
    OBR.party.onChange((party) => {
      getPlayers(document.querySelector("#PList"));
	  console.log("party-changed");
    })
	
	//Respond to changes
	OBR.room.onMetadataChange((metadata) => {
		sendmsg();
    })


}); //End Function

//================================================================

async function getPlayers(element) {
	const theplayers= await OBR.party.getPlayers();
	const sortedplayers=theplayers.sort();
	const nodes = [];
	
    for (const player of sortedplayers) {

	  const node = document.createElement("option");
      node.innerHTML = `${player.name}`;
      nodes.push(node);  
    }
	
	element.replaceChildren(...nodes);

};
//================================================================
async function writemsg()
{
	// Get Players to Send to
	var e = document.getElementById("PList");
	var value = e.value;
	var receivernmame = e.options[e.selectedIndex].text;
	var sendername=await OBR.player.getName()
	
	//var receiverid= await OBR.player.id
	
	// Get text to send
	var currentmessage = document.getElementById("message").value;

	if(currentmessage&&receivernmame)
	{
		//OBR.notification.show(usernmame +" - "+currentmessage, "SUCCESS")
		
		await OBR.room.setMetadata({
			[getPluginId("obcsender")]:sendername,
			[getPluginId("obcreceiver")]:receivernmame,
			[getPluginId("obctext")]:currentmessage
		})
	}
	
	var mydisplay = await OBR.room.getMetadata()
	//console.log(getPluginId("obcsender"))
	
	//OBR.notification.show(mydisplay[getPluginId("obcsender")])
	
	
}
//================================================================
async function sendmsg()
{
	var mydisplay = await OBR.room.getMetadata()
	var myid=await OBR.player.getName()
	
	if (myid==mydisplay[getPluginId("obcreceiver")])
	{
		OBR.notification.show(mydisplay[getPluginId("obcsender")] +": "+ mydisplay[getPluginId("obctext")],"ERROR")
	}
	
	if (myid==mydisplay[getPluginId("obcsender")])
	{
		OBR.notification.show("Message Sent to " + mydisplay[getPluginId("obcreceiver")],"SUCCESS")
	}
	
	await OBR.room.setMetadata({
		[getPluginId("obcsender")]:[],
		[getPluginId("obcreceiver")]:[],
		[getPluginId("obctext")]:[]
	})
	
	
}


//================================================================
async function getSelectedItemsAndCounters() {
	
	let result = [];

	const selection = await OBR.player.getSelection();
	
	const  myitems = await OBR.scene.items.getItems(selection);

	if (!myitems) return result;
		
	// get counters for all items
    const tokenCounters = await OBR.scene.items.getItems((item) => {
		const metadata = item.metadata[getPluginId("metadata")];  
		return Boolean(isPlainObject(metadata) && metadata.enabled);
    });
			
	return myitems;
};

//================================================================
function isPlainObject(item)
{
  return (
    item !== null && typeof item === "object" && item.constructor === Object
  );
}

//================================================================
  function onFocus(e) {
    (e.target).select();
  };
  
//================================================================
   function isBad(n) {
		return isNaN(n) || `${n}`.includes("e");
  }
  
//================================================================
    async function onInput(e) {
		
    const inputValue = parseInt((e.target).value);

	const controlin=event.srcElement.id

	var countername="";
	var inputname="";

	if (controlin=="OBMC_Value_t") 
	{
		countername="OBMC_t";
	} 
	else if (controlin=="OBMC_Value_m") 
	{
		countername="OBMC_m";
	} 
	else
	{
		countername="OBMC_b";
	}	

	var inputF = document.getElementById(controlin);	

	const myitems= await getSelectedItemsAndCounters();
	
	const tokenCounters = await OBR.scene.items.getItems((item) => {
      const metadata = item.metadata[getPluginId("metadata")];
      return Boolean(isPlainObject(metadata) && metadata.enabled);
    });
	
	for (const item of myitems) 
	{
		const currentcounter=tokenCounters.find((c) => c.attachedTo === item.id&&c.name==countername);
		if(!currentcounter && !isBad(inputValue) && inputValue !== 0)
		{
			addCounter(item, inputValue,countername);
		}
		else if(isBad(inputValue) || inputValue === 0)
		{
			if(currentcounter)
			{
				OBR.scene.items.deleteItems([currentcounter.id]);
			}
			
			(e.target).value=0;	
			
		}
		else
		{
		     OBR.scene.items.updateItems([currentcounter], (counterItems) => {
				const number = parseInt(currentcounter.text.plainText);
				counterItems[0].text.plainText = `${inputValue}`;
			 });
			// (e.target).value=`${inputValue}`;	
			inputF.setAttribute('value',`${inputValue}`);	
		}//End If
	} //End For
  } //End Function