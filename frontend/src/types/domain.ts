export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type SocialLinks = {
    github?: string;
    linkedin?: string;
    twitter?: string;
};

export type AuthUser = {
    id: string;
    email: string;
    name?: string;
    bio?: string;
    professionalTitle?: string;
    location?: string;
    profileImage?: string;
    backgroundImage?: string;
    resumeUrl?: string;
    socialLinks?: SocialLinks;
    createdAt?: string;
    updatedAt?: string;
};

export type Skill = {
    _id: string;
    userId: string;
    skillName: string;
    level: SkillLevel;
    description?: string;
    attachments: string[];
    createdAt: string;
    updatedAt: string;
};

export type ProfilePayload = {
    name?: string;
    bio?: string;
    professionalTitle?: string;
    location?: string;
    profileImage?: string;
    backgroundImage?: string;
    resumeUrl?: string;
    socialLinks?: SocialLinks;
};

export type AppSettings = {
    email: string;
    username: string;
    privacy: {
        publicProfile: boolean;
        showOnlineStatus: boolean;
        searchVisibility: boolean;
    };
    notifications: {
        emailRequests: boolean;
        emailMessages: boolean;
        emailUpdates: boolean;
        pushDesktop: boolean;
        pushSound: boolean;
    };
};

export type SettingsPayload = {
    email?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
    privacy?: Partial<AppSettings["privacy"]>;
    notifications?: Partial<AppSettings["notifications"]>;
};

export type NotificationType = "connections" | "mentions" | "skills";

export type AppNotification = {
    id: string;
    actorId?: string;
    type: NotificationType;
    group: "today" | "yesterday";
    name: string;
    message: string;
    actionLabel: string;
    secondaryAction?: string;
    unread: boolean;
    time: string;
    createdAt: string;
};

export type PostStatus = "draft" | "published";
export type PostVisibility = "public" | "private";
export type PostCodeLanguage =
    | "typescript"
    | "javascript"
    | "python"
    | "java"
    | "go"
    | "rust"
    | "cpp"
    | "other";

export type AppPost = {
    _id: string;
    userId: string;
    content: string;
    codeSnippet?: string;
    codeLanguage: PostCodeLanguage;
    screenshots: string[];
    attachments: string[];
    visibility: PostVisibility;
    status: PostStatus;
    scheduledAt?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type FeedPost = AppPost & {
    user: {
        id: string;
        name?: string;
        email: string;
        profileImage?: string;
        professionalTitle?: string;
        location?: string;
        connectionStatus?: "none" | "pending" | "connected";
    };
};

export type PostPayload = {
    content?: string;
    codeSnippet?: string;
    codeLanguage?: PostCodeLanguage;
    screenshots?: string[];
    attachments?: string[];
    visibility?: PostVisibility;
    status?: PostStatus;
    scheduledAt?: string | null;
};

export type SkillPayload = {
    skillName: string;
    level: SkillLevel;
    description?: string;
    attachments?: string[];
};

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type ApiError = {
    success?: boolean;
    message?: string;
    error?: string;
    errors?: unknown;
};
