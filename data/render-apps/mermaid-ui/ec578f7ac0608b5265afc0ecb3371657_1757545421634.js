window.utils = {
    // 获取SVG元素的辅助函数
    getSvgElement() {
        const mermaidContainer = document.querySelector(".mermaid");
        const svgElement = mermaidContainer
            ? mermaidContainer.querySelector("svg")
            : null;
        if (!svgElement) {
            throw new Error("SVG element not found");
        }
        return svgElement;
    },

    // 下载svg
    downloadSVG() {
        try {
            const svgElement = window.utils.getSvgElement();
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            const blob = new Blob([svgString], {
                type: "image/svg+xml;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "diagram.svg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading SVG:", error.message);
        }
    },

    // 下载png
    downloadPNG(pixelRatio = 2) {
        try {
            const svgElement = window.utils.getSvgElement();
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // 使用 getBoundingClientRect 获取实际渲染尺寸
            const rect = svgElement.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            // 考虑设备像素比以提高图像质量
            canvas.width = width * pixelRatio;
            canvas.height = height * pixelRatio;

            const svgString = new XMLSerializer().serializeToString(svgElement);
            const img = new Image();

            img.onload = function () {
                // 直接使用放大后的尺寸绘制，保持高分辨率和完整显示
                ctx.drawImage(img, 0, 0, width * pixelRatio, height * pixelRatio);

                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "diagram.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            img.onerror = function () {
                console.error("Failed to load SVG as image");
            };

            // 更安全的 Base64 编码方式
            try {
                img.src =
                    "data:image/svg+xml;base64," +
                    btoa(unescape(encodeURIComponent(svgString)));
            } catch (e) {
                console.error("Failed to encode SVG as base64:", e);
                // 备用方案：使用 Blob URL
                const blob = new Blob([svgString], { type: "image/svg+xml" });
                img.src = URL.createObjectURL(blob);
            }
        } catch (error) {
            console.error("Error downloading PNG:", error.message);
        }
    },

    // 复制到剪切板（作为 PNG 图片）
    copyToClipboard(i18n) {
        try {
            const svgElement = window.utils.getSvgElement();

            // 创建 canvas
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // 使用 getBoundingClientRect 获取实际渲染尺寸
            const rect = svgElement.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            // 考虑设备像素比以提高图像质量
            const pixelRatio = window.devicePixelRatio || 1;
            canvas.width = width * pixelRatio;
            canvas.height = height * pixelRatio;

            const svgString = new XMLSerializer().serializeToString(svgElement);
            const img = new Image();

            img.onload = function () {
                // 直接使用放大后的尺寸绘制，保持高分辨率和完整显示
                ctx.drawImage(img, 0, 0, width * pixelRatio, height * pixelRatio);

                // 将 canvas 转换为 blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        // 检查 Clipboard API 可用性
                        if (navigator.clipboard && window.isSecureContext) {
                            try {
                                // 尝试使用 Clipboard API
                                navigator.clipboard.write([
                                    new ClipboardItem({ "image/png": blob })
                                ]).then(() => {
                                    console.log("PNG image copied to clipboard");
                                    antd.message.success(i18n('common-2'))
                                }).catch(async (err) => {
                                    console.error("Failed to copy PNG image to clipboard: ", err);

                                    // 如果 ClipboardItem 不支持，尝试使用传统方法
                                    if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
                                        try {
                                            const item = new ClipboardItem({
                                                "image/png": blob,
                                                "text/plain": new Blob([blob], { type: "text/plain" })
                                            });

                                            await navigator.clipboard.write([item]);
                                            console.log("Successfully copied using fallback ClipboardItem");
                                            antd.message.success(i18n('common-2'))
                                        } catch (e) {
                                            console.error("Fallback ClipboardItem failed: ", e);
                                            fallbackCopy(blob);
                                        }
                                    } else {
                                        fallbackCopy(blob);
                                    }
                                });
                            } catch (err) {
                                console.error("Clipboard API error: ", err);
                                fallbackCopy(blob);
                            }
                        } else {
                            // Clipboard API 不可用，使用传统方法
                            console.log("Clipboard API not available, using fallback method");
                            fallbackCopy(blob);
                        }
                    } else {
                        console.error("无法将画布转换为 Blob");
                        alert("copy error");
                    }
                }, "image/png");
            };

            img.onerror = function () {
                console.error("Failed to load SVG as image");
                alert("Failed to load SVG as image");
            };

            // 更安全的 Base64 编码方式
            try {
                img.src =
                    "data:image/svg+xml;base64," +
                    btoa(unescape(encodeURIComponent(svgString)));
            } catch (e) {
                console.error("Failed to encode SVG as base64:", e);
                // 备用方案：使用 Blob URL
                const blob = new Blob([svgString], { type: "image/svg+xml" });
                img.src = URL.createObjectURL(blob);
            }
        } catch (error) {
            console.error("Error copying to clipboard:", error.message);
            alert("Error copying to clipboard: " + error.message);
        }

        // 降级方案
        function fallbackCopy(blob) {
            console.log("Using fallback copy method");

            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "diagram.png";

            // 创建并触发点击
            document.body.appendChild(link);
            link.click();

            // 清理
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    },

    // 获取图片url（返回 data URL 格式的 SVG）
    getMermaidImageUrl() {
        try {
            const svgElement = window.utils.getSvgElement();
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
        } catch (error) {
            console.error("Error getting SVG data URL:", error.message)
        }
    },

    // 复制文字到剪切板
    copyTextToClipboard(text, i18n) {
        // 创建文本区域
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // 确保内容不会被截断
        textArea.style.position = "fixed";
        textArea.style.opacity = 0;
        textArea.style.pointerEvents = "none";
        textArea.style.left = "-1000px";
        textArea.style.top = "-1000px";
        
        document.body.appendChild(textArea);
        
        // 选择文本
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices
        
        try {
            // 执行复制命令
            const successful = document.execCommand('copy');
            if (successful) {
                console.log("Text successfully copied to clipboard");
                antd.message.success(i18n('common-2'))
            } else {
                console.error("Failed to copy text to clipboard");
            }
        } catch (err) {
            console.error("Error in copyToClipboard: ", err);
        } finally {
            // 清理
            document.body.removeChild(textArea);
            // 恢复焦点
            window.focus();
        }
    },
}