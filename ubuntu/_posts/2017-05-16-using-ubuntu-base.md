---
layout: post
title: "Using Ubuntu-base arm64 rootfs fir Raspberry Pi 3"
category: ubuntu
excerpt_separator: <!--more-->
---

Following my previous [post](rpi3-64bit-kernel-and-Uboot-booting-up), we now can now boot our kernel thru U-boot. 
Now were going to create a filesystem base from arm64 ubuntu base rootfs.

Create a folder were we will extract the Ubuntu base <a href="http://cdimage.ubuntu.com/ubuntu-base/releases/16.04.2/release/ubuntu-base-16.04.2-base-arm64.tar.gz"><b>rootfs</b></a>, and tar to extract.
```
$ mkdir rootfs
$ cd rootfs/
$ sudo tar xzvf ubuntu-base-16.04.2-base-arm64.tar.gz
```
<!--more-->
Install the kernel module and firmware into the rootfs folder.
```
$ sudo ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- modules_install INSTALL_MOD_PATH={directory}/rootfs/
$ sudo ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- firmware_install INSTALL_FW_PATH={directory}rootfs/lib/firmware/
```

Check that it was installed correctly.
```
$ ls rootfs/lib/modules/4.11~

	build               modules.builtin        modules.devname      modules.symbols.bin
	kernel              modules.builtin.bin    modules.order        source
	modules.alias       modules.dep            modules.softdep
	modules.alias.bin   modules.dep.bin        modules.symbols
```

Well use `chroot` to further setup our filesystem.
```
$ sudo cp -av /usr/bin/qemu-aarch64-static {directory}/rootfs/usr/bin
```
###### [](#header-6)Or use rsync: rsync -azvh source destination

###### [](#header-6)Note:
###### [](#header-6)*	/usr/bin/<b>qemu-arm-static</b> is for 32-bit armhf architecture
###### [](#header-6)*	/usr/bin/<b>qemu-aarch64-static</b> is for 64-bit arm64 architecture

Then we need to copy `resolv.conf` from our host machine for internet connection to `rootfs/etc/`:
```
$ sudo cp -av /run/resolvconf/resolv.conf rootfs/etc/
```

Enter chroot environment:
```
$ sudo chroot {directory}rootfs/
```

Now that you're in the chroot environment, we can now add an admin user with sudo permission.
```
$ useradd -G sudo -m -s /bin/bash pi3
$ echo pi3:pi3 | chpasswd
```
###### [](#header-6)Note: The format input line of chpasswd is: user_name:password.


You can setup your `hostname` here for your target device or in the kernel configuration making sure that the hostname is empty.
```
$ echo U-Base_min > /etc/hostname
$ echo 127.0.0.1 localhost > /etc/hosts
$ echo 127.0.1.1 U-Base_min >> /etc/hosts
```

Fetch the latest package lists from server then upgrade.
```
$ apt-get update
$ apt-get upgrade
```

Then install these first:
```
$ apt-get install dialog perl
```
We need those installed first to correct some error messages abot locale:
```
$ locale-gen "en_US.UTF-8"
	Generating locales...
  		en_US.UTF-8... done
	Generation complete.
```
Install minimal packages:
```
$ apt-get install sudo ifupdown net-tools ethtool udev wireless-tools iputils-ping resolvconf wget apt-utils wpasupplicant initramfs-tools
```

Create a Ramdisk(optional).
```
$ mkinitramfs -o /boot/initrd.img /lib/modules/4.11~
```

When everything you want to setup has been done, exit chroot:
```
$ exit
```

To reduce the rootfs/ size we can remove some unwanted files.
Create a file `/etc/dpkg/dpkg.cfg.d/01_nodoc` which specifies the desired filters. Example:
```
path-exclude /usr/share/doc/*
# we need to keep copyright files for legal reasons
path-include /usr/share/doc/*/copyright
path-exclude /usr/share/man/*
path-exclude /usr/share/groff/*
path-exclude /usr/share/info/*
# lintian stuff is small, but really unnecessary
path-exclude /usr/share/lintian/*
path-exclude /usr/share/linda/*
```

Then you can manually remove any documentation already installed:
```
$ sudo find rootfs/usr/share/doc -depth -type f ! -name copyright|xargs rm || true
$ sudo find rootfs/usr/share/doc -empty|xargs rmdir || true
$ sudo rm -rf rootfs/usr/share/man/* rootfs/usr/share/groff/* rootfs/usr/share/info/*
$ sudo rm -rf rootfs/usr/share/lintian/* rootfs/usr/share/linda/* rootfs/var/cache/man/*
```

Then copy the `rootfs/` content to the 2nd partition of your µSD car. Or you could make an image file with several partition on it. This will create a 2gb empty img file:
```
$ sudo dd if=/dev/zero of=myimage.img bs=1024 count=2M
```

Then partition it using `fdisk` in my case:
```
$ sudo fdisk myimage.img
	Result:
	| Device     | Boot | Start 	| End	  | Sectors |
	|:-----------|:-----|:----------|:--------|:--------|
	| myimage1   |      | 2048  	| 1026047 | 1024000 | Fat
	| myimage2   |      | 1026048 	| 4194303 | 3168256 | Linux
```

Display the name of the assigned loop device:
```
$ sudo losetup --find --show myimage.img
	
	/dev/loop0
```
Then we can use `fdisk` to identify our image file partitions assinged loop
```
$ sudo fdisk /dev/loop0

	Device:
		/dev/loop1
		/dev/loop2
```

Then, to assign a loopback device: and format it.
```
$ sudo losetup /dev/loop1 myimage.img 
$ sudo losetup /dev/loop2 myimage.img
$ sudo mkfs.vfat /dev/loop1
$ sudo mkfs.ext4 /dev/loop2
```
###### [](#header-6)mkfs.vfat -n `partition name` /dev/loop1

Mount and Copy those necessary files that we need to their respected partition.
```
$ sudo mount /dev/loop1 /mnt/boot
$ sudo mount /dev/loop2 /mnt/rootfs

	then umount and detach:
$ sudo umount /dev/loop1
$ sudo umount /dev/loop2
$ sudo losetup --detach /dev/loop1
$ sudo losetup --detach /dev/loop2
```
You can now burn that myimage.img to yor µsd card.
Now boot it up and you should now be able to login.

Net post will be about setting up the wifi.

##### [](#header-5)Reference:
*	http://docs.khadas.com/social/BuildUbuntuRootfsViaUbuntuBase/
*	https://gnu-linux.org/building-ubuntu-rootfs-for-arm.html
*	http://manpages.ubuntu.com/manpages/xenial/man8/losetup.8.html

<hr />