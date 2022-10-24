sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/f/library",
	"TeamChat/controller/BaseController"
], function(JSONModel, Controller, Filter, FilterOperator, Sorter, fioriLibrary, BaseController) {
	"use strict";
	var that;

	return BaseController.extend("TeamChat.controller.ChatsSet", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf TeamChat.view.ChatsSet
		 */
		onInit: function() {
			that = this;
			this.oView = this.getView();

			//Chats : the Chat List in the master page
			var oChatsSetModel = new JSONModel();
			this.setModel(oChatsSetModel, "Chats");

			//chat : current selected friends
			var oChatModel = new JSONModel();
			this.setModel(oChatModel, "chat");

			//chat Messages (Received & Sent)
			var oAllChatModel = new JSONModel();
			this.setModel(oAllChatModel, "allMessages");

			// myself Lizzy
			var oMyself = {
				phone: "649120015",
				contactName: "Lizzy",
				photo: "images/naomi.jpg"
			};
			var oMyselfModel = new JSONModel();
			oMyselfModel.setData(oMyself);
			this.getOwnerComponent().setModel(oMyselfModel, "myself");
			oMyselfModel.refresh();

			this.initialLoadJSONFile();

		},

		initialLoadJSONFile: function() {
			var oReceivedSet;
			var oSentSet;
			var oChatsSet;
			var oReceivedSetModel = new JSONModel();
			var oSentSetModel = new JSONModel();
			var oChatsSetModel = new JSONModel();

			var oNewReceivedSet = [];
			var oNewChat = [];
			var oNewSentSet = [];
			var oNewAllSet = [];

			//async load JSON file and create the model
			//format the date for sorting
			//get the latested message / date for all freinds and sort by date desc
			oSentSetModel.loadData("mockdata/SentMessagesSet.json");
			oSentSetModel.attachRequestCompleted(function(oEvent) {
				oSentSet = oEvent.getSource().getData();

				oReceivedSetModel.loadData("mockdata/ReceivedMessagesSet.json");
				oReceivedSetModel.attachRequestCompleted(function(oEvent) {
					oReceivedSet = oEvent.getSource().getData();

					oChatsSetModel.loadData("mockdata/chatsSet.json");
					oChatsSetModel.attachRequestCompleted(function(oEvent) {
						oChatsSet = oEvent.getSource().getData();

						oSentSet.map(function(oSentChat) {
							//newDate the date with format YYYYMMDDHHMMSS for sorting
							//newFormatDate: the new Date()
							var oNewSentSetData = {
								phone: oSentChat.phone,
								contactName: "",
								photo: "",
								id: oSentChat.id,
								text: oSentChat.text,
								date: oSentChat.date,
								newDate: that.getNewDate(oSentChat.date),
								newFormatDate: that.getFormatNewDate(oSentChat.date),
								sent: oSentChat.sent ? oSentChat.sent : false,
								delivered: oSentChat.delivered ? oSentChat.delivered : false,
								read: oSentChat.read ? oSentChat.read : false,
								catalog: "Sent"
							};
							oNewSentSet.push(oNewSentSetData);
							oNewAllSet.push(oNewSentSetData);
						});

						// sort by New date
						oNewSentSet = that.sortByNewDate(oNewSentSet);

						oSentSetModel.setData(oNewSentSet);
						that.setModel(oSentSetModel, "SentMessages");
						oSentSetModel.refresh();

						oReceivedSet.map(function(oRecChat) {
							var oNewReceivedSetData = {
								phone: oRecChat.phone,
								contactName: "",
								photo: "",
								id: oRecChat.id,
								text: oRecChat.text,
								date: oRecChat.date,
								newDate: that.getNewDate(oRecChat.date),
								newFormatDate: that.getFormatNewDate(oRecChat.date),
								sent: "",
								delivered: "",
								read: "",
								catalog: "Received"
							};
							oNewReceivedSet.push(oNewReceivedSetData);
							oNewAllSet.push(oNewReceivedSetData);
						});
						//
						oNewReceivedSet = that.sortByNewDate(oNewReceivedSet);

						oNewAllSet = that.sortByNewDate(oNewAllSet);

						oChatsSet.map(function(oChat) {
							// remove myself from chat list
							if (oChat.phone !== "649120015") {

								var oLatestRec = that.getLatestMessage(oChat.phone, oNewAllSet);
								var oLatestReceived = that.getLatestMessage(oChat.phone, oNewReceivedSet);
								var oActiveInHowLong;
								if (oLatestReceived && oLatestReceived.newFormatDate) {
									oActiveInHowLong = that.getActiveInHowLong(oLatestReceived.newFormatDate);
								}
								var oName = oChat.photo;
								//remove the begin images/ and end .jpg from photo string then uppercase the first letter
								oName = oName.replace("images/", "");
								oName = oName.replace(".jpg", "");
								oName = oName.charAt(0).toUpperCase() + oName.slice(1);
								oName = oName + " " + oChat.contactName;
								oNewChat.push({
									phone: oChat.phone,
									contactName: oName,
									photo: oChat.photo,
									LatestMessage: oLatestRec ? oLatestRec.text : "",
									LatestDate: oLatestRec ? oLatestRec.newDate : "",
									ActiveInHowLong: oActiveInHowLong,
									ReceivedMessages: that.getMessagesSetByPhone(oChat, oName, oNewReceivedSet),
									SentMessages: that.getMessagesSetByPhone(oChat, oName, oNewSentSet),
									allMessages: that.getMessagesSetByPhone(oChat, oName, oNewAllSet),
								});
							}
						});

						oNewChat = that.sortByLatestDate(oNewChat);

						oChatsSetModel.setData(oNewChat);
						that.setModel(oChatsSetModel, "Chats");

						oChatsSetModel.refresh();

						var oChatModel = that.getModel("chat");
						oChatModel.setData(oNewChat[0]);
						oChatModel.refresh();
						that.setModel(oChatModel, "chat");
						oChatModel.updateBindings(true);

						var oAllChatModel = that.getModel("allMessages");
						oAllChatModel.setData(oNewChat[0].allMessages);
						oAllChatModel.refresh();
						that.setModel(oAllChatModel, "allMessages");

					});
				});
			});
		},

		getMessagesSetByPhone: function(oChat, oName, OMessagesSet) {
			var result = [];
			var oMyself = that.getModel("myself").getData()
			OMessagesSet.map(function(oMsg) {
				if (oMsg.phone === oChat.phone) {
					if (oMsg.catalog === "Received") {
						oMsg.contactName = oName;
						oMsg.photo = oChat.photo;
					} else {
						oMsg.contactName = oMyself.contactName;
						oMsg.photo = oMyself.photo;
					}
					result.push(oMsg);
				}
			});
			return result;
		},

		getLatestMessage: function(sPhone, oNewReceivedSet) {
			for (var i = 0; i < oNewReceivedSet.length; i++) {
				if (oNewReceivedSet[i].phone === sPhone) {
					return oNewReceivedSet[i];
				}
			}
		},

		onNavigate: function(oEvent) {
			//This code was generated by the layout editor.
			var oItem = oEvent.getSource();

			var oFCL = this.oView.getParent().getParent();

			oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);

			var oChat = oItem.getBindingContext("Chats").getObject();

			var oAllChatModel = this.getModel("allMessages");
			oAllChatModel.setData(oChat.allMessages);
			oAllChatModel.refresh();

			that.setModel(oAllChatModel, "allMessages");

			this.getOwnerComponent().getModel("chat").setData(oChat);
			this.getOwnerComponent().getModel("chat").refresh();

			// var oRouter = this.getOwnerComponent().getRouter();
			// oRouter.navTo("chat", {
			// 	// phone: window.encodeURIComponent(oItem.getBindingContext("Chats").getObject().phone)
			// 	phone: oItem.getBindingContext("Chats").getObject().phone
			// });

		},

		onSearch: function(oEvent) {
			let sQuery = oEvent.getSource().getValue();
			var oFilter1 = [];
			var allFilters = [];

			var oModel = that.getModel("Chats");
			var oPhoneList = [];
			if (sQuery !== "") {
				let filtered = oModel.getData().filter(topGroup => {
					// Filter second Level
					let filteredSingleElements = topGroup.allMessages.filter(singleElement => {
						let search = sQuery.toLowerCase();
						let valueFound = (
							// search
							singleElement.text.toLowerCase().includes(search)
						);
						return valueFound;
					});
					return (filteredSingleElements.length > 0);
				});
				// filtered in a phone set which have search content
				// create a new filter sets for Chats
				filtered.map(function(oFiltered) {
					oFilter1.push(new Filter("phone", FilterOperator.EQ, oFiltered.phone));
				});
				allFilters = new Filter({
					filters: oFilter1,
					and: false
				});
			}

			this.byId("ChatList").getBinding("items").filter(allFilters, "Application");

		}

	});

});