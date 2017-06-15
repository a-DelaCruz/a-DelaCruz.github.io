---
layout: post
title:  "Raspberry Pi 3 Alpine Linux arm64"
category: alpine
excerpt_separator: <!--more-->
---
As i was been busy studying and learning about Docker and how nice it is to use Alpine linux as the docker image because of it being small is size... unlike using ubuntu as a docker image file...This time... i decided to try Alpine linux on Raspberry Pi 3.

#### Prerequisites:
*   Alpine linux Generic Arm - [aarch64](https://nl.alpinelinux.org/alpine/v3.6/releases/aarch64/alpine-uboot-3.6.1-aarch64.tar.gz)
*   For the kernel and U-boot...just follow my previous [post](rpi3-64bit-kernel-and-Uboot-booting-up).

The files that we only need from alpine are `initramfs-vanilla`,`moodloop-vanila`, and `apk` folder. so go ahead and extract them.

`initramfs-vanilla` is a compressed cpio archive. to extract it we do this:
```
$ mkdir temp
$ cd temp
$ sudo gunzip -c /boot/initramfs-vanilla | cpio -i
```

Then we need to install our latest modules into it...assuming you already compiled kernel 4.12. following this [post](rpi3-64bit-kernel-and-Uboot-booting-up).
```
$ sudo ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- make modules_install INSTALL_MOD_PATH=../temp/
        when it is done go back to /temp/ folder where we extract the initramfs and into the modules folder.
$ cd temp/lib/modules/
        and remove the kernel previous version
$ sudo rm -rf 4.9~
```

Now we have our custom initramfs and then recreate the compressed cpio archive again.
Inside the folder run:
```
$ sudo find . | cpio -H newc -o | gzip -9 > /boot/initramfs-rpi3
```

`modloop-vanilla` is a squashfs file. make a temp folder for our custom squashfs. Then mount the `modloop-vanilla` and extract the `/fimware` folder from it.
```
$ mkdir /squashfs
$ sudo mount -t modloop-vanilla /mnt
$ sudo cp -av /mnt/modules/firmware /squashfs
$ sudo umount /mnt
```

We also need to install module on it like we this above. And make sure to have the structure like this:
```
$ ls /squashfs

    /squashfs/modules/firmware
    /squashfs/modules/4.12~
```

To make our own squashfs... using this: mksquashfs [source folder] [SquashFS target file] -comp xz -Xdict-size 100%
```
$ sudo mksquashfs /squashfs modloop-rpi3 - comp xz -Xdict-size 100%
```

And now we have our own `initramfs-rpi3` and `modloop-rpi3`. Our µsd card should now look like this:
```
/apk
/boot/Image
/boot/kernel8.img
/boot/boot.scr
/boot/initramfs-rpi3
/boot/modloop-rpi3
bcm2710-rpi-3-b.dtb
bootcode.bin
start.elf 
fixup.dat 
config.txt
cmdline.txt
```

We'll modify the `cmdline.txt` and `boot.scr` for alpine linux.
##### cmdline.txt
```
modules=loop,squashfs,sd-mod,usb-storage quiet net.ifnames=0 dwc_otg.lpm_enable=0 console=ttyAMA0,115200 fsck.repair=yes rootwait
```

##### boot.scr
```
fdt addr 0x100
fdt get value bootargs /chosen bootargs
setenv kernel_addr_r 0x01000000
setenv ramdisk_addr_r 0x02100000
fatload mmc 0:1 ${kernel_addr_r} boot/Image
fatload mmc 0:1 ${ramdisk_addr_r} boot/initramfs-rpi3
setenv initrdsize $filesize
fatload mmc 0:1 ${fdt_addr_r} bcm2710-rpi-3-b.dtb
booti ${kernel_addr_r} ${ramdisk_addr_r}:${initrdsize} ${fdt_addr_r}
```

Go ahead noew and try to boot it up. You should have an output like this:

![](/alpine/images/alpine-linux-arm64-rpi3.jpg)

As you can see... there's a hwclock error since our raspberry pi 3 don't have any. So after you run `setup-alpine` and use `lbu commit ` to save changes...run this:
```
rc-update add swclock boot    # enable the software clock
rc-update del hwclock boot    # disable the hardware clock
```
In my case i use `Busybox NTP` as it might be the most lightweight solution. Save the changes and reboot.
```
lbu commit
reboot
```

##### Reference:
*   http://backreference.org/2010/07/04/modifying-initrdinitramfs-files/
*   https://askubuntu.com/questions/437880/extract-a-squashfs-to-an-existing-directory
*   https://wiki.alpinelinux.org/wiki/DIY_Fully_working_Alpine_Linux_for_Allwinner_and_Other_ARM_SOCs
*   https://wiki.alpinelinux.org/wiki/Raspberry_Pi