---
layout: post
title: "Using Ubuntu-base arm64 rootfs fir Rpi3"
excerpt_separator: <!--more-->
---
<div>
<p>
	Following my previous post, we now can now boot our kernel thru U-boot. 
	Now were going to create a filesystem base from arm64 ubuntu base rootfs.
<br>

<br>
	Create a folder were we will extract the Ubuntu base <a href="http://cdimage.ubuntu.com/ubuntu-base/releases/16.04.2/release/ubuntu-base-16.04.2-base.arm64.tar.gz"><b>rootfs</b></a>, and tar to extract.
<pre>	mkdir rootfs
	cd rootfs/
	sudo tar xzvf ubuntu-base-16.04.2-base-arm64.tar.gz
</pre>
<!--more-->
<br>

<br>
	Install the kernel module and firmware into the rootfs folder.
<pre>	sudo ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- modules_install INSTALL_MOD_PATH={directory}/rootfs/
	sudo ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- firmware_install INSTALL_FW_PATH={directory}rootfs/lib/firmware/
</pre>
<br>

<br>
	Check that it was installed correctly.
<pre>	ls rootfs/lib/modules/4.11~

	build               modules.builtin        modules.devname      modules.symbols.bin
	kernel              modules.builtin.bin    modules.order        source
	modules.alias       modules.dep            modules.softdep
	modules.alias.bin   modules.dep.bin        modules.symbols
</pre>
<br>

<br>
	Well use <b>chroot</b> to further setup our filesystem.
<pre>	sudo cp av /usr/bin/qemu-aarch64-static {directory}/rootfs/usr/bin
</pre>

<pre>Note:
     /usr/bin/<b>qemu-arm-static</b> is for 32-bit armhf architecture
     /usr/bin/<b>qemu-aarch64-static</b> is for 64-bit arm64 architecture
</pre>
<br>

<br>
	Enter chroot environment:
<pre>	sudo chroot {directory}rootfs/
</pre>
<br>

<br>
	Now that youre in the chroot environment, we can now add an admin user with sudo permission.
<pre>	useradd -G sudo -m -s /bin/bash rpi3
	echo rpi3:raspberry | chpasswd
</pre>
<small><sub>	Note: The format input line of chpasswd is: user_name:password.</sub></small>
<br>

<br>
	Setup a <small>hostname</small> for your target device.
<pre>	echo U-Base_min > /etc/hostname
	echo 127.0.0.1 localhost > /etc/hosts
	echo 127.0.1.1 U-Base_min >> /etc/hosts
</pre>
<br>

<br>
	Fetch the latest package lists from server then upgrade.
<pre>	apt-get update
	apt-get upgrade
</pre>
<br>

<br>
	Install minimal packages:
<pre>	apt-get install sudo ifupdown net-tools ethtool udev wireless-tools iputils-ping perl resolvconf 
	wget apt-utils dialog wpasupplicant initramfs-tools
</pre>
<br>

<br>
	Create a Ramdisk(optional).
<pre>	mkinitramfs -o /boot/initrd.img /lib/modules/4.11~
</pre>
<br>

<br>
	When everything you want to setup has been done, exit chroot:
<pre>	exit
</pre>
<br>

<br>
	Then copy the rootfs/ content to the 2nd partition of your µSD car. 
	Now boot it up and you should now be able to login.
<br>

<br>
	Net post will be about setting up the wifi.
<br>

<br>

<br>
	Reference:
<pre>	http://docs.khadas.com/social/BuildUbuntuRootfsViaUbuntuBase/
	https://gnu-linux.org/building-ubuntu-rootfs-for-arm.html
</pre>
</p>
</div>
<hr />
