---
layout: post
title:  "Rpi3 64bit kernel and U-boot booting up"
excerpt_separator: <!--more-->
---
<div>
<p>
	I recently tried if it is possible to compile this on Windows 10 Bash Creators update... And it did compile.
	The only drawback for now is that i can not chroot to Ubuntu base rootfs and could not mount .img file created by dd. 
	So for now i'll use a virtual machine for creating .img file with partitions.
<br>
<br>
<strong>	Cross-build prerequisite:</strong>
<pre>	gcc-arch64-linux-gnu    g++-5                  ncurses-dev
	make                    git                    bc          
	u-boot-tools            device-tree-compiler   pkg-config-aarch64-linux-gnu
	libncurses5-dev
</pre>
<!--more-->

<br>
	Assuming there is already a Cross-build environment: Built on Ubuntu Server 16.04.02
<br>

<br>
<strong>	Prerequisites:</strong>
<pre>	Ubuntu Base <a href="http://cdimage.ubuntu.com/ubuntu-base/releases/16.04.2/release/ubuntu-base-16.04.2-base.arm64.tar.gz">Rootfs</a> <small>(install additional package using <sup><b>apt-get</b></sup>)</small>
	Raspberry pi <a href="https://github.com/raspberrypi/linux.git">kernel</a> <small>(Have not tried using <b>Upstream kernel</b>)</small>
	Raspberry pi <a href="https://github.com/raspberrypi/firmware/tree/master/boot">firmware</a> <small>(<b>bootcode.bin, start.elf, fixup.dat</b> and the rest of <b>start_</b> and <b>fixup_</b>)</small>
	<a href="http://www.denx.de/wiki/U-Boot/WebHome">U-boot</a>
</pre>

<br>
<br>
<strong>	µSD card:</strong><small><b>(assuming you already know how to partition it)</b></small>
<br>

<br>
	Your µSD card<small>(boot partition)</small> should contain the following:
<pre>	bootcode.bin
	start.elf <i>(and the rest of the <strong>start_</strong> file)</i>
	fixup.dat <i>(and the rest of the <strong>fixup_</strong> file)</i>
	config.txt
	cmdline.txt
</pre>
<br>

<br>
	For the <strong>config.txt</strong> and <strong>cmdline.txt</strong>, we have to create them and include this lines.
<br>

<br>
<em>	config.txt:  </em>
<pre>	arm_control=0x200
	force_turboo=1
	enable_uart=1
	device_tree_address=0x100
	device_tree_end=0x8000
	#kernel=u-boot.bin
	dtparam=i2c_arm=on
	dtparam=spi=on
</pre>
<br>

<br>
<em>	cmdline.txt:</em>
<pre>	net.ifnames=0 dwc_otg.lpm_enable=0 console=ttyAMA0,115200 console=tty1 root=/dev/mmcblk0p2 rootfstype=ext4 elevator=deadline fsck.repair=yes rootwait
</pre>
<br>

<br>
<strong>	U-Boot:</strong>
<br>

<br>
	Get the source code by cloning the U-Boot git repository or download the tar file.
<pre>	git clone depth 1 branch v2017.03 single-branch git://git.denx.de/u-boot.git
	ftp://ftp.denx.de/pub/u-boot/u-boot-2017.03.tar.bz2
</pre>
<br>

<br>
	Then configure and build u-boot. For 64-bit use <b>rpi_3_defconfig</b>
<pre>	cd u-boot/
	sudo make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- rpi_3_defconfig
</pre>
<br>

<br>
	Then compile it.
<pre>	sudo make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu-
</pre>
<br>

<br>
	To change output directory use <sup><b>O=directory path/</b></sup>
<pre>	sudo make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- O=directory path/
</pre>
<br>

<br>
	After it has been built. Locate <sup><b>u-boot.bin</b></sup> as this is the file we need. 
	Copy it to your µSD card and rename it to <sup><b>kernel8.img</b></sup> or keep its name as it is and <sup><b>uncomment the line kernel=u-boot.bin</b></sup> in <sup><b>config.txt</b></sup>. 
	Boot it up to confirm that its working.
<br>


<br>

<strong>	Kernel:</strong>
<br>

<br>
	Get the kernel source code at the official Raspberry pi git repository.
<pre>	git clone depth 1 branch v2017.03 single-branch https://github.com/raspberrypi/linux.git
</pre>
<br>

<br>
	Use <b>bcmrpi3_defconfig</b> for kernel config. 
	You can further configure it according to your needs. But for now, its fine to leave it be.
<pre>	cd linux
	sudo make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- bcmrpi3_defconfig
	sudo make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- -j 3
            after the above compiled run for device-tree-blob:
	sudo make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- -j 3 dtbs
</pre>
<br>

<br>
	Locate <sup><b>Image</b></sup> (no need to convert for U-Boot use it as it is for 64bit) file at <sup><b>arch/arm64/boot/</b></sup> 
	and the <sup><b>bcm2710-rpi-3-b.dtb</b></sup> at <sup><b>arch/arm/boot/dts/</b></sup>. Im having trouble using 
	<sub><b>bcm2837-rpi-3-b.dtb</b></sub>. So for now use <sup><b>bcm2710-rpi-3-b.dtb</b></sup> instead. 
	Copy the <sup><b>Image</b></sup> and <sup><b>bcm2710-rpi-3-b.dtb</b></sup> files to your <i>µSD card boot partition</i>. 
	At this point, you can test it if it will boot the kernel but we need to have a <i>boot script</i> that U-Boot needs. 
	Were using the <sup><b>boot.script</b></sup> from this file: <a href="https://www.finnie.org/software/raspberrypi/ubuntu-rpi3/20160517-raspi3-arm64-firmware-kernel.tar.xz"><b>20160517-raspi3-arm64-firmware-kernel.tar.xz</b></a>. 
<br>

<br>
	Modify and create the <sup><b>boot.scr</b></sup> from it.
<pre>	mkimage -A arm64 -O linux -T script -d /path/to/boot.script /path/where/you/want/to/save
</pre>
<br>

<br>
	<b>boot.script</b> should look like this:
<pre>	fdt addr 0x100
	fdt get value bootargs /chosen bootargs
	setenv kernel_addr_r 0x01000000
	setenv ramdisk_addr_r 0x02100000
	fatload mmc 0:1 ${kernel_addr_r} Image
	fatload mmc 0:1 ${ramdisk_addr_r} initrd.img
	setenv initrdsize $filesize
	fatload mmc 0:1 ${fdt_addr_r} bcm2710-rpi-3-b.dtb
	booti ${kernel_addr_r} ${ramdisk_addr_r}:${initrdsize} ${fdt_addr_r}
</pre>
<br>

<br>
	Since we dont have a <sub><b>Ramdisk</b></sub> yet, comment that line and replace <sup><b>${ramdisk_addr_r}:${initrdsize}</b></sup> with <sup><b>-</b></sup>.
	Or copy the <sup><b>initrd.img</b></sup> to use it temporarily. 
	You can now then verify at this point that our kernel boot as well and will stop at some point 
	since we still do not have a filesystem.
<br>

<br>

<br>	
	next post will be about on how to make a filesystem base on Ubuntu Base.
<br>

<br>

<br>
	Reference:
<pre>	https://wiki.ubuntu.com/ARM/RaspberryPi/RaspberryPi3"
	https://wiki.ubuntu.com/Base
	https://www.raspberrypi.org/documentation/linux/kernel/building.md
	https://kernelnomicon.org/?p=682
</pre>
</p></div>
<hr />
