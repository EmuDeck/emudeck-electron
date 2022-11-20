1. <s>single quotes for all strings where we don't want bash expansion. We had a bug come up recently with a user who set their sudo password with the appimage and expansion broke their password.</s>
2. switch all refs to /bin/sh to /bin/bash to explicitly use bash.

   2b) test gyro install after.

3. add an optino to download the ES-DE alpha.

   3b) this will need a section called like Tools Guides. Can put SRM and ES-DE there

4. Install detection not triggering in the about emulators pages? I had someone delete cemu.exe and it still showed as installed.

   Non - AppImage stuff

5. we need to clean up repos.

   <s>1b) merge main hotfixes to beta and dev.</s>

   <s>1c) merge beta changes to dev</s>

6. <s>beta appimage should pull beta git</s>
7. <s>make a dev appimage to pull dev git</s>
8. <s>can you address beebles question about the font on the emudeck site?</s>
