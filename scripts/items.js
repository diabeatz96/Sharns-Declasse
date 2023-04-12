import { Declasse } from "./module.js";
import { getActorData, getActorItem, getItemData, setItemData } from "./helpers.js";
/*
    This script will allow you to inject a feature option into the game that will allow you to
    change the physical and mental modifiers for the Declasse system. 
    When selecting a feature, you will be able to select a physical or mental modifier addition based on your
    character's attributes.

    This will be put under the details tab of the character sheet.
    The feature will be called "Declasse Settings and Effect the rolls".
*/

class ItemSheetData {

   static createItemSheetData(itemId) {
        const triggers = {
            physical: false,
            mental: false,
            AP: 0,
            tags: ["test-tag", "ASI", "BUTTON"],
        }
        return getItemData(itemId)?.setFlag(Declasse.ID, Declasse.FLAGS.triggers, triggers);
    }

    static getTriggers(userId, itemId) {
        return getActorItem(userId, itemId)?.getFlag(Declasse.ID, Declasse.FLAGS.triggers);
    }

    static setTriggers(userId, itemId, triggers) {
        return getActorItem(userId, itemId)?.setFlag(Declasse.ID, Declasse.FLAGS.triggers, triggers);
    }

    static setAP (itemId, AP) {
        let triggers = getItemData(itemId).getFlag(Declasse.ID, Declasse.FLAGS.triggers);
        triggers.AP = AP;
        getItemData(itemId).setFlag(Declasse.ID, Declasse.FLAGS.triggers, triggers);
    }
    
    static setTags (itemId, tags) {
        let triggers = getItemData(itemId).getFlag(Declasse.ID, Declasse.FLAGS.triggers);
        triggers.tags = tags;
        getItemData(itemId).setFlag(Declasse.ID, Declasse.FLAGS.triggers, triggers);
    }

    static getAP(itemId) {
        return getItemData(itemId).getFlag(Declasse.ID, Declasse.FLAGS.triggers).AP;
    }

    static getTags(itemId) {
        return getItemData(itemId).getFlag(Declasse.ID, Declasse.FLAGS.triggers).tags;
    }
};

const renderSidebar = (sheet, html, data) => {
    const sidebar = html.find(".item-properties");

    //check if item is class
    if(sheet.item.type !== "feat") {
        return;
    }

    if(!getItemData(sheet.item.id).getFlag(Declasse.ID, Declasse.FLAGS.triggers)) {
        ItemSheetData.createItemSheetData(sheet.item.id);
    }

    sidebar.append(`<label class = 'properties-header'> Tags </label> <ol class = 'properties-list'>
    ${ItemSheetData.getTags(sheet.item.id).map(tag => `<li>${tag}</li>`).join("")}    
    </ol>`); 
    // create a button that will allow you to add a tag to the item
    sidebar.append(`<div> <label class = "properties-header"> Tags settings </label>
    <button id = 'save-tag'> Save Tag </button>
    <input class = "flex-row small-input-height" type = "text" placeholder ="type tag here" id = 'tag'>
    <button id = 'delete-tag'> Delete Tag </button>
    </div>`);

    html.find("#save-tag").click(() => {
        let tag = html.find("#tag").val();
        let tags = ItemSheetData.getTags(sheet.item.id);
        tags.push(tag);
        console.log(tags);
        ItemSheetData.setTags(sheet.item.id, tags);
    })

    html.find("#delete-tag").click(() => {
        let tags = ItemSheetData.getTags(sheet.item.id);
        tags.pop();
        ItemSheetData.setTags(sheet.item.id, tags);
    })

    sidebar.append(`<div> <label class = "properties-header"> AP </label> <input type = 'number' id = 'ap' value = '${ItemSheetData.getAP(sheet.item.id)}'> </div>`);
    sidebar.append(`<button id = 'save'> Save </button>`);

    html.find("#save").click(() => {
        let AP = html.find("#ap").val();
        console.log(AP.value);
      
        ItemSheetData.setAP(sheet.item.id, AP);
    });
}


const renderDetails = (sheet, html, data) => {
    const table = html.find(".details");

    if(!sheet.actor) { 
        table.append(`<h3 class = "form-header"> Declasse Modifiers </h3> <p class = "bold"> Please Attach to character sheet first. </p>`);
        return; 
    }

    const actorId = sheet.actor.id;

    function setPhysicalItem(state) {
        let triggers = ItemSheetData.getTriggers(actorId, sheet.item.id);
        if(state === "false") {
            triggers.physical = false;
        } else {
        triggers.physical = true;
        console.log(triggers.physical + " " + sheet.item.id + " " + actorId);
        }
        ItemSheetData.setTriggers(actorId, sheet.item.id, triggers);
    }

    function setMentalItem(state) {
        let triggers = ItemSheetData.getTriggers(actorId, sheet.item.id);
        if(state === "false") {
            triggers.mental = false;
            ItemSheetData.setTriggers(actorId, sheet.item.id, triggers);
        } else {
        triggers.mental = true;
        console.log(triggers.mental + " " + sheet.item.id + " " + actorId);
        }
        ItemSheetData.setTriggers(actorId, sheet.item.id, triggers);
    }

    let physDialogue = new Dialog({
        title: "Physical Mod Dialog",
        content: "<p>Will you be adding your Physical Modifer to Rolls?</p>",
        buttons: {
         one: {
          icon: '<i class="fas fa-check"></i>',
          label: "Yes",
          callback: () => setPhysicalItem("true")
         },
         two: {
          icon: '<i class="fas fa-times"></i>',
          label: "No",
          callback: () => setPhysicalItem("false")
         }
        },
        default: "two",
       });

       let mentDialogue = new Dialog({
        title: "Mental Mod Dialog",
        content: "<p>Will you be adding your Mental Modifer to Rolls?</p>",
        buttons: {
         one: {
          icon: '<i class="fas fa-check"></i>',
          label: "Yes",
          callback: () => setMentalItem("true")
         },
         two: {
          icon: '<i class="fas fa-times"></i>',
          label: "No",
          callback: () => setMentalItem("false")
         }
        },
        default: "two",
       });



    if(!ItemSheetData.getTriggers(actorId, sheet.item.id)) {
        ItemSheetData.createItemSheetData(actorId, sheet.item.id);
        console.log("Created Data");
    } else {
        console.log("Data already exists");
    }

    // If table is a feature, add the Declasse Modifiers


    // create button tp toggle physical and mental modifiers
    table.prepend(`
    <h3 class = "form-header"> Declasse Modifiers </h3>
    <div class = "form-group">
        <label>Add Physical Modifier ?</label>
        <input type = "text" name="data.physical" value = ${ItemSheetData.getTriggers(actorId, sheet.item.id).physical ? "Yes" : "No "} >
    </div>
    <div class = "form-group">
        <label>Add Mental Modifier ?</label>
        <input type = "text" name="data.mental" value = ${ItemSheetData.getTriggers(actorId, sheet.item.id).mental ? "Yes" : "No"}>
    </div>
    `);

    // add event listeners when the buttons are clicked to toggle the modifiers
    html.find("input[name='data.physical']").click(() => physDialogue.render(true));
    html.find("input[name='data.mental']").click(() => mentDialogue.render(true))
}


Hooks.on("renderItemSheet5e", (sheet, html, data) => {
    

    renderSidebar(sheet, html, data);
    renderDetails(sheet, html, data);
    
 ;

});

Hooks.on("renderChatMessage", (message, html, data) => {
    

    console.log("THIS IS TRIGGERING");
    console.log(message);
    console.log(html);
    console.log(data);

});
