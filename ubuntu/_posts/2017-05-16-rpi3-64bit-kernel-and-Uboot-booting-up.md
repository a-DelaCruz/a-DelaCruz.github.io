---
layout: post
title:  "Raspberry Pi 3 64bit kernel and U-boot booting up"
category: ubuntu
excerpt_separator: <!--more-->
---

Updated, Organized and corrected some typos:

#### [](#header-4)Cross-build prerequisite:
```
gcc-arch64-linux-gnu    g++-5                  ncurses-dev
make                    git                    bc          
u-boot-tools            device-tree-compiler   pkg-config-aarch64-linux-gnu
libncurses5-dev
```
<!--more-->
Assuming there is already a Cross-build environment: Built on Ubuntu Server 16.04.02

#### [](#header-4)Prerequisites:
*	Ubuntu Base <a href="http://cdimage.ubuntu.com/ubuntu-base/releases/16.04.2/release/ubuntu-base-16.04.2-base-arm64.tar.gz">Rootfs</a> (install additional package using apt-get)
*	Raspberry pi <a href="https://github.com/raspberrypi/linux.git">kernel</a> (Have not tried using Upstream kernel)
*	Raspberry pi <a href="https://github.com/raspberrypi/firmware/tree/master/boot">firmware</a>(bootcode.bin, start.elf, fixup.dat as this are the min. files to boot)
*	<a href="http://www.denx.de/wiki/U-Boot/WebHome">U-boot</a>

#### [](#header-4)µSD card: `(assuming you already know how to partition it)`

Your µSD card(fat partition 1) should contain the following:
```
/boot
bootcode.bin
start.elf 
fixup.dat 
config.txt
cmdline.txt
```
###### [](#header-6)Note: `/boot` sub-folder will contain our U-Boot file, Kernel and Initrd image file.

For the `config.txt` and `cmdline.txt`, we have to create them and include this lines.

##### [](#header-5)config.txt:
```
arm_control=0x200
force_turboo=1
enable_uart=1
device_tree_address=0x100
device_tree_end=0x8000
kernel=boot/kernel8.img
dtparam=i2c_arm=on
dtparam=spi=on
```


##### [](#header-5)cmdline.txt:
```
net.ifnames=0 dwc_otg.lpm_enable=0 console=ttyAMA0,115200 console=tty1 root=/dev/mmcblk0p2 rootfstype=ext4 elevator=deadline fsck.repair=yes rootwait
```

#### [](#header-4)U-Boot:
Get the source code by cloning the U-Boot git repository or download the tar file.
```
$ git clone depth 1 branch v2017.03 single-branch git://git.denx.de/u-boot.git
```
or download:
```
ftp://ftp.denx.de/pub/u-boot/u-boot-2017.03.tar.bz2
```

Then configure and build u-boot. For 64-bit use `rpi_3_defconfig`
```
$ cd u-boot/
$ sudo make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- rpi_3_defconfig
```

Then compile it.
```
$ sudo make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu-
```

To change output directory use `O=Output path/`
```
$ sudo make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- O=Output path/
```

After it has been built. Locate `u-boot.bin` in your output_path as this is the file we need. 
Copy it to your µSD card inside `/boot folder` and rename it to `kernel8.img` or keep its name as is in config.txt. 
Boot it up to confirm that its working.

#### [](#header-4)Kernel:
Get the kernel source code at the official Raspberry pi git repository.
```
$ git clone depth 1 branch v2017.03 single-branch https://github.com/raspberrypi/linux.git
```

Use `bcmrpi3_defconfig` for kernel config. 
You can further configure it according to your needs. But for now, its fine to leave it be.
You can also change the output directory using: `O=Output_path/`
```
$ cd linux
$ sudo make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- bcmrpi3_defconfig
$ sudo make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- -j3
```

Locate `Image` (no need to convert for U-Boot use it as it is for 64bit) file at your output_path/ `arch/arm64/boot/` 
and the `bcm2710-rpi-3-b.dtb` at `arch/arm/boot/dts/`. I encounter problem using 
`bcm2837-rpi-3-b.dtb`. So for now use `bcm2710-rpi-3-b.dtb` instead. 
Copy the `Image` in `/boot folder` and `bcm2710-rpi-3-b.dtb` in the upper most directory of your µSD card.
It should look like this:
```
/boot/Image
/boot/kernel8.img
bcm2710-rpi-3-b.dtb
bootcode.bin
start.elf 
fixup.dat 
config.txt
cmdline.txt
```

At this point, you can test it if it will boot the kernel but we need to have a boot script that U-Boot needs. 
Were using the boot.script from this file: <a href="https://www.finnie.org/software/raspberrypi/ubuntu-rpi3/20160517-raspi3-arm64-firmware-kernel.tar.xz"><b>20160517-raspi3-arm64-firmware-kernel.tar.xz</b></a>. 

Modify and create the `boot.scr` from it.
```
$ mkimage -A arm64 -O linux -T script -d /path/to/boot.script /path/where/you/want/to/save
```

`boot.script` should look like this: and place it inside hte `/boot` folder.
```
fdt addr 0x100
fdt get value bootargs /chosen bootargs
setenv kernel_addr_r 0x01000000
setenv ramdisk_addr_r 0x02100000
fatload mmc 0:1 ${kernel_addr_r} boot/Image
fatload mmc 0:1 ${ramdisk_addr_r} boot/initrd.img
setenv initrdsize $filesize
fatload mmc 0:1 ${fdt_addr_r} bcm2710-rpi-3-b.dtb
booti ${kernel_addr_r} ${ramdisk_addr_r}:${initrdsize} ${fdt_addr_r}
```

Since we dont have a Ramdisk yet, comment that line and replace `${ramdisk_addr_r}:${initrdsize}` with `-`.
Or copy the `initrd.img` to use it temporarily. 
```
/boot/Image
/boot/boot.scr
/boot/kernel8.img
/boot/initrd.img
bcm2710-rpi-3-b.dtb
bootcode.bin
start.elf 
fixup.dat 
config.txt
cmdline.txt
```
You can now then verify at this point that our kernel boot as well and will stop at some point 
since we still do not have a filesystem.

	
Next post will be about on how to make a filesystem base on Ubuntu Base.


##### [](#header-5)Reference:
*	https://wiki.ubuntu.com/ARM/RaspberryPi/RaspberryPi3"
*	https://wiki.ubuntu.com/Base
*	https://www.raspberrypi.org/documentation/linux/kernel/building.md
*	https://kernelnomicon.org/?p=682

<hr />