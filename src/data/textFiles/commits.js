const commits = `
============================================================
>>HYDRA98 CHANGELOG.TXT
============================================================
[2025-05-19]  b2d844d  - clippy
[2025-05-19]  21c379c  - .
[2025-05-19]  c6d6fd3  - .
[2025-05-19]  4ded0c8  - clippy
[2025-05-18]  74d8a71  - more clippy
[2025-05-18]  171b2a4  - headache
[2025-05-18]  7ab843a  - css
[2025-05-18]  6a18623  - clippy
[2025-05-16]  333ec4b  - clippy
[2025-05-16]  95d45b3  - .
[2025-05-16]  8bd8b55  - clippy
[2025-05-16]  5db45fa  - .
[2025-05-16]  38d7319  - utm refresh
[2025-05-16]  8db5d4c  - .
[2025-05-16]  88dca77  - .
[2025-05-16]  cc6899a  - .
[2025-05-16]  f659af6  - revert to db8e3d8
[2025-05-15]  db8e3d8  - more css
[2025-05-15]  6f9a39b  - css
[2025-05-14]  66d22dc  - css
[2025-05-14]  4d71b53  - UTM Tool
[2025-05-14]  63adbf4  - .
[2025-05-14]  6c4377e  - welcome msg
[2025-05-13]  7c819dd  - small bios
[2025-05-13]  77883a8  - bios update
[2025-05-13]  1acfa81  - .
[2025-05-13]  936ccab  - pipes
[2025-05-13]  421323b  - debug and monitorpanel styles
[2025-05-13]  c010b02  - monitorcontrols refresh big
[2025-05-09]  75b83e4  - Remove Maze and fix BouncyBallsScreensaver
[2025-05-09]  9777fd2  - bouncyballs
[2025-05-08]  182f41a  - .
[2025-05-08]  a7c4a1b  - monitor controls big
[2025-05-07]  772bd6d  - .
[2025-05-07]  615dfc2  - css
[2025-05-07]  db4b619  - monitor css
[2025-05-07]  1f0913b  - monitorview and videotest big
[2025-05-06]  db5bb0d  - hookscore
[2025-05-06]  26b734f  - starfield2
[2025-05-06]  10667d7  - ss mode
[2025-05-06]  cef8a7e  - .
[2025-05-06]  fede4bf  - .
[2025-05-06]  ef6efb1  - monitor css
[2025-05-06]  c1cf716  - monitor power btn
[2025-05-06]  3f81b0c  - .
[2025-05-05]  b4849f6  - global fixes and monitorview
[2025-05-05]  dedb3d4  - monitorview updates
[2025-05-05]  be7d8be  - monitor mode
[2025-05-05]  3edb5eb  - fix case sensitivity for MonitorView/index.js
[2025-05-05]  8ad13d2  - small
[2025-05-05]  c874e7b  - small
[2025-05-05]  5138dbd  - .
[2025-05-05]  8a133bf  - .
[2025-05-05]  d0adeec  - new components
[2025-05-05]  2799fa7  - doodle submit
[2025-05-05]  3edefd1  - doodle submit
[2025-05-04]  638bba5  - ascii banners options/css
[2025-05-04]  5aad2bf  - .
[2025-05-04]  4a1fa2e  - .
[2025-05-04]  33b15eb  - .
[2025-05-03]  162bfc7  - .
[2025-05-03]  4f32d1b  - vid players
[2025-05-03]  3489ce8  - .
[2025-05-03]  a58de71  - css
[2025-05-03]  788c659  - ascii css
[2025-05-03]  93a88bd  - ascii banners
[2025-05-03]  667621c  - ascii
[2025-05-02]  278a65b  - pre-roll player
[2025-05-02]  973acd7  - .
[2025-05-02]  3ec95ad  - .
[2025-05-02]  1d9bd42  - .
[2025-05-02]  35d04a2  - m compat
[2025-05-02]  28c1c87  - .
[2025-05-02]  ac2f436  - .
[2025-05-02]  6d15d8e  - ismobile
[2025-05-02]  2b70e22  - winamp stubborn css
[2025-05-02]  e3155fc  - ismobile
[2025-05-02]  85fa448  - winamp stubborn css
[2025-05-02]  7b78803  - .
[2025-05-01]  ea673f1  - .
[2025-05-01]  78c665f  - winamp
[2025-05-01]  78c665f  - winamp
[2025-05-01]  26f4079  - winamp visualizer
[2025-04-30]  7674be9  - small
[2025-04-30]  7674be9  - small
[2025-04-30]  61f4495  - webamp
[2025-04-29]  b518440  - vast rough
[2025-04-29]  a795e4c  - .
[2025-04-29]  95729fb  - small
[2025-04-29]  8659abb  - webkit stuff
[2025-04-28]  e2a4c5f  - wmp update
[2025-04-27]  c616474  - wmp
[2025-04-25]  a7e43d7  - vplayer small
[2025-04-25]  9d7d58a  - vid player and calc big
[2025-04-24]  b9edcaf  - playwright & mediachrome
[2025-04-24]  4c5dab8  - mediachrome player configs
[2025-04-23]  d508df9  - .
[2025-04-23]  d508df9  - .
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
[2025-04-17]  6617b20  - .
[2025-04-17]  6617b20  - .
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

============================================================
`;

export default commits;
