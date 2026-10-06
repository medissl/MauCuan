const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');
module.exports = function withMikoWidget(config) {
  config = withAndroidManifest(config, mod => {
    const app = mod.modResults.manifest.application[0];
    app['meta-data'] ||= [];
    for (const [name, resource] of [
      ['expo.modules.notifications.large_notification_icon', '@drawable/miko_notification_face'],
      ['expo.modules.notifications.default_notification_icon', '@drawable/miko_notification_small'],
    ]) {
      app['meta-data'] = app['meta-data'].filter(meta => meta.$['android:name'] !== name);
      app['meta-data'].push({ $: { 'android:name': name, 'android:resource': resource } });
    }
    return mod;
  });
  return withDangerousMod(config, ['android', mod => {
    const target = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res/drawable');
    fs.mkdirSync(target, { recursive: true });
    for (const [source, dest] of [['waiting','miko_notification_face'], ['idle','miko_widget_idle'], ['happy','miko_widget_happy']]) {
      fs.copyFileSync(path.join(mod.modRequest.projectRoot, 'assets/miko', `miko-pet-${source}.png`), path.join(target, `${dest}.png`));
    }
    fs.writeFileSync(path.join(target, 'miko_notification_small.xml'), '<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFFFF" android:pathData="M6,11 C3,10 2,5 5,4 C8,3 10,6 10,8 L14,8 C14,6 16,3 19,4 C22,5 21,10 18,11 C21,19 17,22 12,22 C7,22 3,19 6,11 Z"/></vector>');
    return mod;
  }]);
};
