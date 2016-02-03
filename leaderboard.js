PlayersList = new Mongo.Collection('players');

if (Meteor.isClient) {
  Meteor.subscribe('thePlayers');
  Template.leaderboard.helpers({
    'player': function() {
      var currentUserId = Meteor.userId();
      return PlayersList.find({}, {
        sort: {
          score: -1,
          name: 1
        }
      });

    },
    'countPlayer': function() {
      return PlayersList.find({
        createdBy: currentUserId
      }).count();
    },
    'selectedClass': function() {
      var playerId = this._id;
      var selectedPlayer = Session.get('selectedPlayer');
      if (playerId == selectedPlayer) {
        return "selected"
      }
    },
    'showSelectedPlayer': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      return PlayersList.findOne(selectedPlayer)
    }

  });

  Template.leaderboard.events({
    'click .player': function() {
      var playerId = this._id;
      console.log("You clicked a .player element");
      Session.set('selectedPlayer', playerId);
      
    },
    'click .increment': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('modifyPlayerScore', selectedPlayer, 5);
    },
    'click .remove': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('removePlayerData', selectedPlayer);
    },
    'click .decrement': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('modifyPlayerScore', selectedPlayer, -5);
    }
  });

  Template.addPlayerForm.events({
    'submit form': function() {
      event.preventDefault();
      var playerNameVar = event.target.playerName.value;
      var playerScoreVar = event.target.playerScore.value;
      var currentUserId = Meteor.userId();

      if (confirm('Are you sure?')) {
        Meteor.call("insertPlayerData", playerNameVar, playerScoreVar);
        event.target.playerName.value = "";
        event.target.playerScore.value = "";
      }

    }
  });

}

if (Meteor.isServer) {
  Meteor.publish('thePlayers', function() {
    var currentUserId = this.userId;
    return PlayersList.find({
      createdBy: currentUserId
    })
  });

  Meteor.methods({
    'insertPlayerData': function(playerNameVar, playerScoreVar) {
      var currentUserId = Meteor.userId();
      PlayersList.insert({
        name: playerNameVar,
        score: parseInt(playerScoreVar),
        createdBy: currentUserId
      });
    },
    'removePlayerData': function(selectedPlayer) {
      var currentUserId = Meteor.userId();
      PlayersList.remove({
        _id: selectedPlayer,
        createdBy: currentUserId
      });
    },
    'modifyPlayerScore': function(selectedPlayer, scoreValue) {
      var currentUserId = Meteor.userId();
      PlayersList.update({
        _id: selectedPlayer,
        createdBy: currentUserId
      }, {
        $inc: {
          score: scoreValue
        }
      });
    }
  });
}
