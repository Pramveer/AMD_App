import{Meteor} from 'meteor/meteor';
import{LiveMysql} from 'meteor/numtel:mysql';


liveDb = new LiveMysql(Meteor.settings.private.DevDb);
//export default liveDb;

//For closing Db connection and application
  var closeAndExit = function() {
      liveDb.end();
      process.exit();
  };

  process.on('SIGTERM', closeAndExit);
  // Close connections on exit (ctrl + c)
  process.on('SIGINT', closeAndExit);
