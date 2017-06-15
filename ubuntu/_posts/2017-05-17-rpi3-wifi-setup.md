---
layout: post
title: "Raspberry Pi 3 Wifi Setup"
category: ubuntu
excerpt_separator: <!--more-->
---

To make the Raspberry pi 3 Wifi to work...we need to get or have atleast 2 files. But first we must create a
folder inside the `/lib/firmware/` and name it `brcm`. And in that folder we'll put
`brcmfmac43430-sdio.bin` and `brcmfmac43430-sdio.txt`.

#### [](#header-4)Prerequisite:

*	<a href="https://github.com/RPi-Distro/firmware-nonfree/tree/master/brcm80211/brcm">brcmfmac43430-sdio.bin</a>
*	<a href="https://github.com/RPi-Distro/firmware-nonfree/tree/master/brcm80211/brcm">brcmfmac43430-sdio.txt</a>
*	wpa-supplicant
*	wireless-tools

<!--more-->
Download and place the `brcmfmac43430-sdio.bin` and `brcmfmac43430-sdio.txt` inside the `/lib/firmware/brcm` folder.
If the file above doesn't make your wifi to work get it directly from the Mainstream linux: <a href="git://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git">here</a>

Next we'll modify `/etc/network/interfaces`.
```
$ sudo nano /etc/network/interfaces
```

And place this following lines:
```
allow-hotplug wlan0
iface wlan0 inet dhcp
wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf
iface default inet dhcp
```

For this setup my wifi interfaces id `wlan0`... yours might be named differently so replace it
that matches yours.
You can set your wifi to static...just browse the references at the bottom of this page..


Then we'll configure `/etc/wpa_supplicant/wpa_supplicant.conf` ... so create/edit the file `wpa_supplicant.conf` and place this lines:
```
network={
    ssid="NetworkEssid"
    scan_ssid=1 # only needed if your access point uses a hidden ssid
    proto=RSN
    key_mgmt=WPA-PSK
    psk="NetworkPassword"
	pairwise=CCMP
	auth_alg=OPEN
}
```
Reboot and verify that wifi is now working and connected to the network.
or you could try this:
```
$ sudo ifconfig wlan0 down
$ sudo ifconfig wlan0 up
```
##### [](#header-5)Reference:
*	https://github.com/RPi-Distro/firmware-nonfree/tree/master/brcm80211/brcm
*	https://help.ubuntu.com/community/WifiDocs/WPAHowTo
*	https://w1.fi/cgit/hostap/plain/wpa_supplicant/wpa_supplicant.conf

<hr />