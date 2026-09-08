package com.yashe.util;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;

public final class ImageUtil {

    /** 目标尺寸：长边最大像素 */
    private static final int MAX_LONG_SIDE = 1600;
    /** 目标体积：不超过 200KB */
    private static final long MAX_BYTES = 200L * 1024L;

    private ImageUtil() {}

    /** 读取任意支持格式（jpg/png/webp），转换为不超过 200KB 的 JPEG 字节。 */
    public static byte[] toCompressedJpeg(byte[] input) throws IOException {
        BufferedImage src = ImageIO.read(new ByteArrayInputStream(input));
        if (src == null) {
            throw new IOException("无法解析图片");
        }
        BufferedImage rgb = flattenAlpha(src);
        if (Math.max(rgb.getWidth(), rgb.getHeight()) > MAX_LONG_SIDE) {
            rgb = resize(rgb, MAX_LONG_SIDE);
        }
        // 从高到低尝试 JPEG 质量，直到低于目标体积
        for (float q : new float[]{0.85f, 0.70f, 0.55f, 0.40f, 0.30f}) {
            byte[] jpeg = encodeJpeg(rgb, q);
            if (jpeg.length <= MAX_BYTES) {
                return jpeg;
            }
        }
        // 兜底：进一步缩小尺寸后输出
        BufferedImage smaller = resize(rgb, MAX_LONG_SIDE / 2);
        return encodeJpeg(smaller, 0.30f);
    }

    /** 将带透明通道的图片铺到白色背景上（JPEG 不支持 alpha）。 */
    private static BufferedImage flattenAlpha(BufferedImage src) {
        BufferedImage rgb = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = rgb.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, rgb.getWidth(), rgb.getHeight());
        g.drawImage(src, 0, 0, null);
        g.dispose();
        return rgb;
    }

    private static BufferedImage resize(BufferedImage src, int maxLongSide) {
        int w = src.getWidth();
        int h = src.getHeight();
        int longSide = Math.max(w, h);
        double scale = Math.min(1.0, (double) maxLongSide / longSide);
        int nw = Math.max(1, (int) Math.round(w * scale));
        int nh = Math.max(1, (int) Math.round(h * scale));
        BufferedImage out = new BufferedImage(nw, nh, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.drawImage(src, 0, 0, nw, nh, null);
        g.dispose();
        return out;
    }

    private static byte[] encodeJpeg(BufferedImage image, float quality) throws IOException {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            throw new IOException("无 JPEG 编码器");
        }
        ImageWriter writer = writers.next();
        try {
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(quality);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (ImageOutputStream ios = ImageIO.createImageOutputStream(baos)) {
                writer.setOutput(ios);
                writer.write(null, new IIOImage(image, null, null), param);
            }
            return baos.toByteArray();
        } finally {
            writer.dispose();
        }
    }
}
