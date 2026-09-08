package com.yashe.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.yashe.entity.SocialMediaItem;
import com.yashe.mapper.SocialMediaItemMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

class AdminSocialMediaControllerTest {

    @TempDir
    Path tempDir;

    private static SocialMediaItem item(String platform, String image, String caption) {
        SocialMediaItem i = new SocialMediaItem();
        i.setPlatform(platform);
        i.setImage(image);
        i.setCaption(caption);
        i.setSortOrder(1);
        i.setStatus(1);
        return i;
    }

    @Test
    void updateReplacedImageDeletesOldFile() throws Exception {
        Path oldFile = tempDir.resolve("douyin").resolve("old.jpg");
        Files.createDirectories(oldFile.getParent());
        Files.write(oldFile, new byte[]{1, 2, 3});

        SocialMediaItemMapper mapper = mock(SocialMediaItemMapper.class);
        when(mapper.findById(1L)).thenReturn(item("douyin", "/api/uploads/douyin/old.jpg", "old"));
        when(mapper.update(any(SocialMediaItem.class))).thenReturn(1);
        when(mapper.countByImage("/api/uploads/douyin/old.jpg")).thenReturn(0);

        AdminSocialMediaController controller = new AdminSocialMediaController(mapper, tempDir.toString());
        controller.update(1L, item("douyin", "/api/uploads/douyin/new.jpg", "new"));

        assertThat(Files.exists(oldFile)).isFalse();
    }

    @Test
    void updateSharedImageKeepsOldFile() throws Exception {
        Path oldFile = tempDir.resolve("douyin").resolve("old.jpg");
        Files.createDirectories(oldFile.getParent());
        Files.write(oldFile, new byte[]{1, 2, 3});

        SocialMediaItemMapper mapper = mock(SocialMediaItemMapper.class);
        when(mapper.findById(1L)).thenReturn(item("douyin", "/api/uploads/douyin/old.jpg", "old"));
        when(mapper.update(any(SocialMediaItem.class))).thenReturn(1);
        when(mapper.countByImage("/api/uploads/douyin/old.jpg")).thenReturn(1);

        AdminSocialMediaController controller = new AdminSocialMediaController(mapper, tempDir.toString());
        controller.update(1L, item("douyin", "/api/uploads/douyin/new.jpg", "new"));

        assertThat(Files.exists(oldFile)).isTrue();
    }
}
