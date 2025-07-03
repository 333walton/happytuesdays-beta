const commits = `
======================================================
>>HAPPY TUESDAYS CHANGELOG.TXT
======================================================
[2025-07-02]  efbe12d  - file explorer
[2025-07-02]  2119bbc  - file explorer cubone
[2025-07-01]  fa569d8  - settings fix
[2025-07-01]  7f84644  - agent select start menu
[2025-07-01]  9625425  - start menu
[2025-07-01]  c686eee  - test
[2025-07-01]  c2dec8d  - more start menu
[2025-07-01]  5c2ea09  - feeeds
[2025-07-01]  3d58985  - start menu
[2025-07-01]  6e51f99  - start menu refresh and cycle detection safeguards
[2025-06-29]  c06e676  - neo4j mcp
[2025-06-29]  3aa4915  - queries added
[2025-06-29]  6542c6b  - neo4j improvements
[2025-06-29]  06c2a3d  - neo4j setup
[2025-06-24]  af09921  - rss
[2025-06-24]  b81f59b  - WindowsLaund pos dt
[2025-06-24]  8c72fda  - starfield2 debug
[2025-06-24]  bd48568  - controls panel bug fix
[2025-06-24]  938fd49  - context menu
[2025-06-24]  2b57e57  - genie removed
[2025-06-21]  843baf8  - crt mobile
[2025-06-21]  df4ed8d  - crt task mngr
[2025-06-20]  555cd5f  - more css
[2025-06-20]  00008dd  - css
[2025-06-20]  7f96448  - clippyfaq
[2025-06-20]  484d7e6  - chatbot v1
[2025-06-20]  6581ac3  - this got the webchat working again
[2025-06-18]  6010aca  - botpress progress
[2025-06-18]  1adecd9  - (testing)
[2025-06-17]  d75c7a4  - botpress prog
[2025-06-17]  6a92f3e  - mobile pressbot
[2025-06-16]  10f3a43  - pressbot v2
[2025-06-16]  e5988d5  - pressbot
[2025-06-15]  db2b5b9  - chat resize fix
[2025-06-15]  056d0df  - submenu pos
[2025-06-15]  6355d68  - refactor fixes
[2025-06-15]  4ccecd9  - Post-refactoring state - balloon positioning changed, botpress chat missing
[2025-06-14]  1c1a40f  - botpress chat
[2025-06-13]  a1552e9  - agent swapping logic
[2025-06-12]  8e37af1  - agent-aware positioning v1
[2025-06-12]  43adf0c  - provider and positioning fixes
[2025-06-12]  8fbfdfd  - positioning file modulate
[2025-06-12]  e8d9582  - revert
[2025-06-11]  57fd94f  - clippy agent bugs
[2025-06-10]  5e19141  - dt agents styling
[2025-06-10]  813b4fe  - positioning fixes for new agents
[2025-06-10]  eb1f439  - universal agent rules
[2025-06-10]  892d49a  - more agent changes
[2025-06-10]  5accb51  - agent changes (tricky)
[2025-06-09]  bef1d6a  - mobile clippyqpt
[2025-06-09]  ee7c457  - vertical chat balloon drag
[2025-06-09]  a568b52  - txt css
[2025-06-09]  66812f6  - txt files
[2025-06-09]  1f6de10  - notepad content updates
[2025-06-09]  m16817f  - m/dt menu arrows
[2025-06-08]  d769849  - webkit
[2025-06-08]  f327297  - webkit icons
[2025-06-08]  84c796f  - context menu dt/m css
[2025-06-08]  2e3aec2  - dynamic positioning
[2025-06-08]  636f2a8  - submenus
[2025-06-08]  2d86887  - submenu fixes
[2025-06-08]  4f5808e  - mobile double tap detection
[2025-06-08]  a8bb857  - interaction rules
[2025-06-08]  cbbabef  - interaction rule refining
[2025-06-08]  c582932  - txt css
[2025-06-08]  a081474  - txt files
[2025-06-08]  1f62d1b  - notepad content updates
[2025-06-08]  e31e137  - nvdt menu arrows
[2025-06-08]  47de6db  - webkit
[2025-06-08]  f827297  - webkit icons
[2025-06-08]  6471b9f  - context menu dt/m css
[2025-06-08]  d30f7a3  - dynamic positioning
[2025-06-08]  2d80a97  - submenus
[2025-06-08]  9f79d8f  - submenu fixes
[2025-06-08]  a8b8a07  - double double tap detection
[2025-06-08]  c89a6ef  - interaction rules
[2025-06-08]  f4d61a5  - interaction rule refining
[2025-06-07]  2111e12  - chatballon
[2025-06-07]  5c119ff  - selectors and debugs
[2025-06-07]  3b0f35f  - rip button balloons
[2025-06-07]  6a18264  - Improved Taskbar-Anchored Logic
[2025-06-06]  7cd8ca2  - ios google app
[2025-06-06]  2fce5c1  - mobile qa
[2025-06-06]  e5e53cc  - google app/Chrome
[2025-06-06]  414eb88  - mobile qa
[2025-06-06]  80f4207  - qa
[2025-06-06]  30c68ab  - ios
[2025-06-06]  1193762  - more bugs
[2025-06-06]  9ac407e  - qa
[2025-06-06]  a211d9c  - qa
[2025-06-06]  0e8e5c6  - qa
[2025-06-06]  97ba3e3  - clippy pos
[2025-06-06]  bb8b56f  - mobile
[2025-06-06]  f861ba4  - taskbar pos logic
[2025-06-06]  1607ba1  - mobile browser positionings
[2025-06-06]  6fabe5b  - scale bugs
[2025-06-06]  ce55bb8  - custom tooltips
[2025-06-06]  8ea53ba  - mobile quickstart
[2025-06-05]  7e8f426  - quicklaunch shortcut
[2025-06-05]  a8e53c4  - hide/show
[2025-06-05]  4b8de2f  - double-tap
[2025-06-05]  c415397  - webkit keyboard
[2025-06-05]  8d8bb4c  - more menu css
[2025-06-05]  f8f4373  - menu css
[2025-06-04]  82e2314  - menu css
[2025-06-04]  4becf86  - context menu scss
[2025-06-04]  ea94536  - context menu
[2025-06-04]  773b3a2  - scss balloons
[2025-06-04]  5a22aff  - mobile balloon scss
[2025-06-04]  7ae6cd8  - balloon sizing mobile/dt
[2025-06-04]  c186972  - mobile css
[2025-06-04]  c591e3b  - clippy v10000
[2025-06-04]  bce1447  - clippy css
[2025-06-02]  617fe4b  - pos2
[2025-06-02]  e180b85  - balloon pos
[2025-05-31]  3ce6d36  - css
[2025-05-30]  3e058fe  - css
[2025-05-30]  7ffb413  - clippy menu css
[2025-05-30]  6b4de8d  - Fix context menu with React Portal approach
[2025-05-30]  7085e04  - some clippy balloon resizing and dt interaction fixes
[2025-05-29]  1d7861f  - clippy chat edits
[2025-05-29]  e776eb7  - prog
[2025-05-28]  de77e42  - bin icons
[2025-05-28]  1b8f0af  - clippy drag safari
[2025-05-28]  4d5e938  - lockfunlock
[2025-05-28]  c501e4d  - randomizer v1
[2025-05-28]  be13dc9  - css
[2025-05-28]  7e42f78  - visibilityAmp v1
[2025-05-27]  146f7d2  - btns
[2025-05-27]  5af8b63  - lock/hide buttons v1
[2025-05-27]  35ad647  - md files update
[2025-05-27]  74de738  - css
[2025-05-27]  742e178  - visibilityAmp v1
[2025-05-26]  106f732  - btns
[2025-05-26]  5af8b63  - lock/hide buttons v1
[2025-05-26]  534647c  - md files update
[2025-05-25]  671ed6c  - clippy v2
[2025-05-25]  4a79bd7  - Merge branch 'main' of https://github.com/hydraburn-007/hydraOS
[2025-05-25]  1bc1b18  - revert
[2025-05-24]  7e590bb  - bad clippy
[2025-05-24]  1078d4f  - Fix to clippy position drift during window resize
[2025-05-24]  c579e0b  - clippy css
[2025-05-24]  4f980c4  - startupShutdown sequence clippy
[2025-05-24]  fee757e  - bad clippy
[2025-05-24]  c518808  - Fix ClippyAssistant test file errors and React warnings
[2025-05-24]  0cc38af  - markdowns added and fix ESLint errors in ClippyAssistant test files
[2025-05-24]  2361673  - centralize Clippy positioning and fix mobile interaction issues
[2025-05-24]  798b57f  - clippy v1000
[2025-05-24]  2588e25  - centralized position controls
[2025-05-24]  1a07736  - clippy mobile
[2025-05-24]  13968cf  - based clippy
[2025-05-24]  1374b59  - clippy
[2025-05-24]  1818a4f  - Complete ClippyAssistant migration with performance improvements
[2025-05-24]  6dc1cbf  - clippy
[2025-05-23]  6a9c276  - backup before ClippyAssistant migration
[2025-05-21]  814de9f  - readme
[2025-05-21]  c67b8e4  - gits
[2025-05-21]  b851c47  - clippy fix v1
[2025-05-20]  157367d  - menulist
[2025-05-20]  5863a9e  - clippy fix
[2025-05-20]  d347e9f  - clippy
[2025-05-20]  1086ba6  - readme
[2025-05-20]  ace5153  - readme and debugs
[2025-05-19]  b2d844d  - clippy
[2025-05-19]  4ded0c8  - clippy
[2025-05-18]  74d8a71  - more clippy
[2025-05-18]  171b2a4  - headache
[2025-05-18]  7ab843a  - css
[2025-05-18]  6a18623  - clippy
[2025-05-16]  333ec4b  - clippy
[2025-05-16]  8bd8b55  - clippy
[2025-05-16]  38d7319  - utm refresh
[2025-05-16]  f659af6  - revert to db8e3d8
[2025-05-15]  db8e3d8  - more css
[2025-05-15]  6f9a39b  - css
[2025-05-14]  66d22dc  - css
[2025-05-14]  4d71b53  - UTM Tool
[2025-05-14]  6c4377e  - welcome msg
[2025-05-13]  7c819dd  - small bios
[2025-05-13]  77883a8  - bios update
[2025-05-13]  936ccab  - pipes
[2025-05-13]  421323b  - debug and monitorpanel styles
[2025-05-13]  c010b02  - monitorcontrols refresh big
[2025-05-09]  75b83e4  - Remove Maze and fix BouncyBallsScreensaver
[2025-05-09]  9777fd2  - bouncyballs
[2025-05-08]  a7c4a1b  - monitor controls big
[2025-05-07]  615dfc2  - css
[2025-05-07]  db4b619  - monitor css
[2025-05-07]  1f0913b  - monitorview and videotest big
[2025-05-06]  db5bb0d  - hookscore
[2025-05-06]  26b734f  - starfield2
[2025-05-06]  10667d7  - ss mode
[2025-05-06]  ef6efb1  - monitor css
[2025-05-06]  c1cf716  - monitor power btn
[2025-05-05]  b4849f6  - global fixes and monitorview
[2025-05-05]  dedb3d4  - monitorview updates
[2025-05-05]  be7d8be  - monitor mode
[2025-05-05]  3edb5eb  - fix case sensitivity for MonitorView/index.js
[2025-05-05]  8ad13d2  - small
[2025-05-05]  c874e7b  - small
[2025-05-05]  d0adeec  - new components
[2025-05-05]  2799fa7  - doodle submit
[2025-05-05]  3edefd1  - doodle submit
[2025-05-04]  638bba5  - ascii banners options/css
[2025-05-03]  4f32d1b  - vid players
[2025-05-03]  a58de71  - css
[2025-05-03]  788c659  - ascii css
[2025-05-03]  93a88bd  - ascii banners
[2025-05-03]  667621c  - ascii
[2025-05-02]  278a65b  - pre-roll player
[2025-05-02]  35d04a2  - m compat
[2025-05-02]  6d15d8e  - ismobile
[2025-05-02]  2b70e22  - winamp stubborn css
[2025-05-02]  e3155fc  - ismobile
[2025-05-02]  85fa448  - winamp stubborn css
[2025-05-01]  78c665f  - winamp
[2025-05-01]  78c665f  - winamp
[2025-05-01]  26f4079  - winamp visualizer
[2025-04-30]  7674be9  - small
[2025-04-30]  7674be9  - small
[2025-04-30]  61f4495  - webamp
[2025-04-29]  b518440  - vast rough
[2025-04-29]  95729fb  - small
[2025-04-29]  8659abb  - webkit stuff
[2025-04-28]  e2a4c5f  - wmp update
[2025-04-27]  c616474  - wmp
[2025-04-25]  a7e43d7  - vplayer small
[2025-04-25]  9d7d58a  - vid player and calc big
[2025-04-24]  b9edcaf  - playwright & mediachrome
[2025-04-24]  4c5dab8  - mediachrome player configs
[2025-04-23]  bd7d5c4  - v mobile test
[2025-04-23]  9a612c9  - video player mobile
[2025-04-23]  054828c  - vid players
[2025-04-21]  8ee6a1e  - paint restart
[2025-04-21]  5922103  - paint css
[2025-04-21]  144db1f  - vercel paints
[2025-04-20]  d428c00  - pixel doodle
[2025-04-20]  c306c7e  - small
[2025-04-20]  c306c7e  - small
[2025-04-20]  7e3174c  - ascii text saveas
[2025-04-20]  5275f90  - alert
[2025-04-19]  ee30db7  - ascii text saveas css
[2025-04-19]  b0af66b  - menuoptions
[2025-04-18]  c4d37bd  - ascii maze m
[2025-04-18]  b9b9bd3  - sb
[2025-04-18]  926d964  - storybook
[2025-04-18]  7c7129b  - ascii
[2025-04-18]  68798f2  - ascii text
[2025-04-18]  65deee5  - asciitext
[2025-04-18]  23df4b6  - small
[2025-04-18]  23df4b6  - small
[2025-04-17]  fa6e5b6  - jsdos
[2025-04-17]  f8f3893  - small
[2025-04-17]  f8f3893  - small
[2025-04-16]  1524077  - css
[2025-04-16]  7d1629c  - ascii maze dt
[2025-04-15]  43691f0  - rebel command
[2025-04-15]  26b5bc6  - dood
[2025-04-15]  c550d21  - small
[2025-04-15]  37cf697  - start menu small
[2025-04-14]  2ce3326  - star wars
[2025-04-13]  3b0264a  - small
[2025-04-13]  5b9539d  - notepad
[2025-04-13]  d95ec92  - small
[2025-04-13]  18aeea7  - text css fixes
[2025-04-13]  7a00e07  - small mobile
[2025-04-13]  8e0c3ce  - small mobile
[2025-04-13]  14be038  - small
[2025-04-13]  61a109d  - explorerwindow css
[2025-04-13]  b909cbb  - small
[2025-04-13]  45ab369  - imagewindow css
[2025-04-13]  4df840c  - small
[2025-04-13]  a3051e6  - explorer window for img
[2025-04-12]  402b569  - filebrowser prog
[2025-04-12]  7c27586  - css menu
[2025-04-11]  23693fb  - preroll rough
[2025-04-11]  c371e7b  - start m small
[2025-04-11]  aef52ea  - newsletter small
[2025-04-11]  c96adca  - start menu
[2025-04-10]  6624ab2  - small css
[2025-04-10]  de58c68  - vid player and css
[2025-04-10]  edfaff2  - Buttons fix
[2025-04-09]  3ac6020  - small minesweeper
[2025-04-09]  18b419a  - gliderpro dt only
[2025-04-09]  66fb3c8  - gliderpro grough dt
[2025-04-09]  903d216  - gliderpro
[2025-04-08]  3f1b454  - submit doodle
[2025-04-08]  4eafe16  - small
[2025-04-08]  306470a  - small
[2025-04-08]  caea059  - start small
[2025-04-08]  035498d  - start menu text
[2025-04-07]  ab1e4fe  - faq css
[2025-04-07]  701b002  - icons
[2025-04-07]  74bab24  - icons
[2025-04-07]  214d3c7  - start menu options
[2025-04-07]  c1024d7  - dt small
[2025-04-07]  88e7e2e  - vid player
[2025-04-07]  a46b3dd  - Scoped the stylings
[2025-04-07]  ede8213  - Update VideoPlayer.js
[2025-04-07]  b4bdf41  - HJel
[2025-04-06]  ec1e8a6  - calc small
[2025-04-06]  9cfdf0e  - small
[2025-04-05]  91b9bdd  - small calc
[2025-04-04]  951a4bf  - mobile calc styling
[2025-04-04]  707effb  - commits log
[2025-04-04]  aabbeed  - change log
[2025-04-04]  e7c80eb  - calc css
[2025-04-04]  15880e4  - crt small
[2025-04-04]  cb2b09b  - frames css
[2025-04-04]  defc20b  - css fixes
[2025-04-04]  4922a0d  - small
[2025-04-04]  2e1baa5  - m auto maximize toggle
[2025-04-04]  fff0d50  - doodle small
[2025-04-03]  c828017  - calc small
[2025-04-03]  fd5c364  - Calculatir
[2025-04-03]  5f4eb15  - small
[2025-04-02]  ce04eaf  - mobile window fix
[2025-04-02]  ce33d08  - small css
[2025-04-02]  ed1341f  - doodle mobile
[2025-04-02]  119cc42  - test4
[2025-04-02]  2998945  - test3
[2025-04-02]  93dfd89  - test3
[2025-04-02]  385ceb9  - test2
[2025-04-02]  b5aa58c  - test
[2025-04-02]  624e1df  - small
[2025-04-02]  ea588a6  - doodle prog
[2025-04-02]  d2d0efd  - doodle styling
[2025-04-02]  ca69066  - more styling
[2025-04-02]  f640e55  - styling
[2025-04-01]  19f26c3  - styling
[2025-04-01]  ef47124  - styling
[2025-04-01]  1a47295  - styling
[2025-04-01]  a69c5c2  - styling headaches
[2025-04-01]  0cf63c2  - small doodles
[2025-04-01]  2caba05  - small doodles
[2025-04-01]  840872f  - small
[2025-04-01]  bf4dfb1  - small
[2025-04-01]  45bd7c0  - doodle alert small
[2025-04-01]  6173d27  - doodle prog
[2025-04-01]  3440155  - small start.js
[2025-04-01]  1ae30c7  - test explorer iframe links
[2025-04-01]  c6b5098  - doodle prog
[2025-04-01]  2dd1d97  - desktop only start.js options
[2025-03-28]  f55082c  - Revert to commit 22a585
[2025-03-28]  222a585  - Helmet added  
[2025-03-28]  0918d32  - Video player  
[2025-03-27]  5102286  - Video player program  
[2025-03-27]  2794dbd  - Start menu organize  
[2025-03-27]  af77882  - Recycling icon small  
[2025-03-26]  88d690d  - Doodle small  
[2025-03-26]  27d4d0c  - Doodles  
[2025-03-26]  9e9f18f  - Start menu small  
[2025-03-26]  c235b1c  - Minesweeper  
[2025-03-23]  be5e8cb  - Small  
[2025-03-23]  ea64742  - Small icons  
[2025-03-22]  c397f81  - Hourglass ASCII  
[2025-03-22]  53cffcb  - Pipes  
[2025-03-21]  3d52a23  - Recycling CSS  
[2025-03-20]  be900bf  - Small trash  
[2025-03-20]  95d778f  - Trash link  
[2025-03-20]  b987d0b  - Demoscene and misc start  
[2025-03-20]  2963823  - Trash  
[2025-03-20]  aed5376  - Small  
[2025-03-20]  e6fdccc  - Start menu  
[2025-03-20]  15d87ca  - Icons  
[2025-03-18]  62aeb8c  - Vid player  
[2025-03-18]  99c5728  - Small  
[2025-03-18]  ac9d4f3  - Small  
[2025-03-18]  86e4463  - Small  
[2025-03-18]  890a804  - Small  
[2025-03-17]  8a61318  - Start menu edits  
[2025-03-16]  ea89dd4  - Small  
[2025-03-16]  a7173d6  - Small  
[2025-03-16]  e1e67fc  - Small  
[2025-03-16]  b3ea98f  - Small  
[2025-03-16]  3f068c4  - DOOM controls popup  
[2025-03-15]  688a739  - Start menu edits  
[2025-03-14]  f251334  - Desktop icon swap  
[2025-03-14]  82e1330  - Error fix  
[2025-03-14]  783db51  - Start menu changes  
[2025-03-14]  734d2aa  - DOOM window load size  
[2025-03-14]  34cb332  - More BIOS changes in index  
[2025-03-14]  bd242e0  - Dawd  
[2025-03-13]  af0ce0e  - More BIOS  
[2025-03-13]  ddd8566  - More BIOS  
[2025-03-13]  64059a2  - BIOS  
[2025-03-13]  2368fb1  - OG metadata  
[2025-03-13]  03f5fc4  - More readme  
[2025-03-13]  417e365  - More readme  
[2025-03-13]  bf2ef8b  - Readme and CSS edits  
[2025-03-13]  3db22b3  - Updated image URL and site content  
[2025-03-13]  2b69809  - Added Google Tag Manager  
[2025-03-12]  094e6e8  - Favicon2  
[2025-03-12]  572cafd  - Favicon  
[2025-03-12]  3cf3c04  - Updated meta tags for Twitter and Discord previews  
[2025-03-12]  eec766b  - Saving my local changes before pulling updates  
[2025-03-12]  70fb2ea  - Update WindowManager.js for open in URL  
[2025-03-08]  cd504a6  - Readme  
[2025-03-08]  1210b74  - CSS edits  
[2025-03-08]  cc8bb3e  - Project files update  
[2025-03-06]  c3131e0  - Initial commit  

======================================================
`;

export default commits;
