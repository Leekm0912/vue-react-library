class FormRenderer {
    constructor(containerId, emulatorId, jsonConfig, options = {}) {
        this.container = document.getElementById(containerId);
        this.emulatorContainer = document.getElementById(emulatorId);
        this.jsonConfig = jsonConfig;
        this.options = options;
        this.formData = {};
        this.defaultImage = "default.png"; // 🔥 기본 이미지 설정
        this.customStyles = options.styles || {}; // 🔥 사용자 지정 스타일 저장
        this.renderForm();
    }

    renderForm() {
        this.container.innerHTML = ""; // 기존 폼 초기화

        const form = document.createElement("form");
        this.applyCustomStyles(form, "form"); // 🔥 폼 스타일 적용
        form.addEventListener("submit", (event) => this.handleSubmit(event));

        this.jsonConfig.params.forEach((field) => {
            const fieldWrapper = document.createElement("div");
            fieldWrapper.className = "form-group";
            this.applyCustomStyles(fieldWrapper, "form-group"); // 🔥 form-group 스타일 적용

            const label = document.createElement("label");
            label.textContent = field.param;
            this.applyCustomStyles(label, "label"); // 🔥 label 스타일 적용
            fieldWrapper.appendChild(label);

            let inputElement;
            switch (field.type) {
                case "string":
                    inputElement = document.createElement("input");
                    inputElement.type = "text";
                    inputElement.maxLength = field.strSize > 0 ? field.strSize : undefined;
                    break;

                case "button":
                    inputElement = document.createElement("input");
                    inputElement.type = "text";
                    inputElement.placeholder = "버튼 이름 입력";
                    break;

                case "file":
                    inputElement = document.createElement("input");
                    inputElement.type = "file";
                    inputElement.accept = "image/*"; // 이미지 파일만 허용
                    inputElement.addEventListener("change", (event) => {
                        const file = event.target.files[0];
                        if (file) {
                            const fileUrl = URL.createObjectURL(file);
                            this.formData[field.param] = fileUrl;
                            this.renderEmulator();
                        }
                    });
                    break;

                default:
                    inputElement = document.createElement("input");
                    inputElement.type = "text";
            }

            inputElement.id = field.param;
            inputElement.name = field.param;
            this.applyCustomStyles(inputElement, "input"); // 🔥 input 스타일 적용

            if (field.type !== "file") {
                inputElement.addEventListener("input", (event) => {
                    this.formData[field.param] = event.target.value;
                    this.renderEmulator();
                });
            }

            fieldWrapper.appendChild(inputElement);
            form.appendChild(fieldWrapper);
        });

        const submitButton = document.createElement("button");
        submitButton.textContent = "제출";
        submitButton.type = "submit";
        this.applyCustomStyles(submitButton, "submit-button"); // 🔥 submit-button 스타일 적용
        form.appendChild(submitButton);

        this.container.appendChild(form);
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log("입력된 데이터:", this.formData);
        this.renderEmulator();
    }

    renderEmulator() {
        this.emulatorContainer.innerHTML = ""; // 기존 UI 초기화

        let layout = JSON.stringify(this.jsonConfig.formattedString.RCSMessage.openrichcardMessage.layout);

        // 🔥 변수 치환 (파일 경로 포함)
        Object.keys(this.formData).forEach((key) => {
            let value = this.formData[key];

            // 🔥 파일 경로 기본값 처리
            if (key === "mTitleMedia" && (!value || value === "{{mTitleMedia}}")) {
                value = this.defaultImage;
            }

            // 🔥 안전한 문자열 변환
            if (typeof value === "string") {
                value = value.replace(/\\/g, "/");
                value = encodeURIComponent(value);
            }

            layout = layout.replace(new RegExp(`{{${key}}}`, "g"), value || "");
        });

        // 🔥 미치환된 변수 제거 (안전한 렌더링)
        layout = layout.replace(/{{.*?}}/g, "");

        // 🔥 Visibility 처리 (visible/gone)
        layout = layout.replace(/"visibility":\s*"{{(.*?)}}"/g, (match, key) => {
            return `"visibility": "${this.formData[key] ? 'visible' : 'gone'}"`;
        });

        // 🔥 JSON 파싱 후 UI 생성
        try {
            const parsedLayout = JSON.parse(layout);
            this.generateHTMLFromLayout(parsedLayout, this.emulatorContainer);
        } catch (error) {
            console.error("에뮬레이터 렌더링 오류:", error);
        }
    }

    generateHTMLFromLayout(layout, parentElement) {
        if (!layout || !layout.children) return;

        layout.children.forEach((child) => {
            let element;

            switch (child.widget) {
                case "LinearLayout":
                    element = document.createElement("div");
                    element.style.display = "flex";
                    element.style.flexDirection = child.orientation === "horizontal" ? "row" : "column";
                    break;

                case "TextView":
                    element = document.createElement("p");
                    element.textContent = child.text || "";
                    element.style.color = child.textColor || "#000";
                    element.style.fontSize = child.textSize || "16px";
                    break;

                case "ImageView":
                    element = document.createElement("img");
                    element.src = child.mediaUrl || this.defaultImage;
                    element.width = parseInt(child.width) || 50;
                    element.height = parseInt(child.height) || 50;
                    break;

                case "Button":
                    element = document.createElement("button");
                    element.textContent = child.text || "버튼";
                    element.style.backgroundColor = child.background || "#ddd";
                    element.style.color = child.textColor || "#000";
                    break;

                case "View":
                    element = document.createElement("div");
                    element.style.height = child.height;
                    element.style.background = child.background;
                    break;

                default:
                    console.warn(`지원되지 않는 위젯 타입: ${child.widget}`);
                    return;
            }

            this.applyCustomStyles(element, child.widget.toLowerCase()); // 🔥 스타일 적용

            // 🔥 Visibility 적용 (gone일 경우 display: none)
            if (child.visibility === "gone") {
                element.style.display = "none";
            }

            parentElement.appendChild(element);

            if (child.children) {
                this.generateHTMLFromLayout(child, element);
            }
        });
    }

    applyCustomStyles(element, styleKey) {
        if (this.customStyles[styleKey]) {
            Object.assign(element.style, this.customStyles[styleKey]);
        }
    }
}

// 📌 FormRenderer를 전역에서 사용할 수 있도록 설정
window.FormRenderer = FormRenderer;
