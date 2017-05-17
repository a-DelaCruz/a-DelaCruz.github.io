---
title: "Rpi3 Wifi Setup"
layout: post
excerpt_separator: <!--more-->
---
<div>
<p>
	To make the Raspberry pi 3 Wifi to work...we need to get or have atleast 2 files. But first we must create a
	folder inside the <em>/lib/firmware</em> and name it <strong>bcm</strong>. And in that folder we'll put
        <strong>brcmfmac43430-sdio.bin</strong> and <strong>brcmfmac43430-sdio.txt</strong>.
</p>
<p><strong>	Prerequisite:</strong>
<pre>		<a href="https://github.com/RPi-Distro/firmware-nonfree/tree/master/brcm80211/brcm">brcmfmac43430-sdio.bin</a>
		<a href="https://github.com/RPi-Distro/firmware-nonfree/tree/master/brcm80211/brcm">brcmfmac43430-sdio.txt</a>
		wpa-supplicant
</pre></p>
<!--more-->
<p>	Download and place the <b>brcmfmac43430-sdio.bin</b> and <b>brcmfmac43430-sdio.txt</b> inside the <em>/lib/firmware/bcm</em> folder.
	If the file above doesn't make your wifi to work get it directly from the Upstream linux: <a href="git://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git">here</a>
</p><br>
	Next we'll modify <em>/etc/network/interfaces</em>.
<pre>	sudo nano /etc/network/interfaces
</pre>
<br>
	And place this following lines:
<pre>	allow-hotplug wlan0
	iface wlan0 inet dhcp
	wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf
	iface default inet dhcp
</pre>

<p>	For this setup my wifi interfaces id <sup><b>wlan0</b></sup>... yours might be named differently so replace it
	that matches yours.
	You can set your wifi to static...just browse the references at the bottom of this page..
</p>

	Then we'll configure wpa_supplicant... so create/edit the file wpa_supplicant.conf and place this lines in:
<pre>	network={
        ssid="NetworkEssid"
        scan_ssid=1 # only needed if your access point uses a hidden ssid
        proto=RSN
        key_mgmt=WPA-PSK
        psk="NetworkPassword"
	pairwise=CCMP
	auth_alg=OPEN
	}
</pre>

<br>
	Reboot and verify that wifi is now working and connected to the network.
<br>

<br>
	Reference:
<pre>	https://github.com/RPi-Distro/firmware-nonfree/tree/master/brcm80211/brcm
	https://help.ubuntu.com/community/WifiDocs/WPAHowTo
	https://w1.fi/cgit/hostap/plain/wpa_supplicant/wpa_supplicant.conf
</pre>

</div>
<hr />
