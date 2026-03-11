"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProfileForm } from "@/components/profile/profile-form";
import { Spinner } from "@/components/ui/spinner";
import { getMyProfile, updateMyProfile } from "@/services/profileServices";
import { uploadProfileImage } from "@/services/uploadServices";
import { useToastStore } from "@/store/toastStore";
import type { ProfilePayload } from "@/types/domain";

export default function EditProfilePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const pushToast = useToastStore((state) => state.pushToast);

    const profileQuery = useQuery({
        queryKey: ["profile", "me"],
        queryFn: getMyProfile,
    });

    const mutation = useMutation({
        mutationFn: async ({
            payload,
            file,
            removeImage,
            backgroundFile,
            removeBackgroundImage,
        }: {
            payload: ProfilePayload;
            file: File | null;
            removeImage: boolean;
            backgroundFile: File | null;
            removeBackgroundImage: boolean;
        }) => {
            let profileImage = profileQuery.data?.data.profile.profileImage || "";
            let backgroundImage = profileQuery.data?.data.profile.backgroundImage || "";

            if (removeImage) {
                profileImage = "";
            } else if (file) {
                const upload = await uploadProfileImage(file);
                profileImage = upload.data.url;
            }

            if (removeBackgroundImage) {
                backgroundImage = "";
            } else if (backgroundFile) {
                const upload = await uploadProfileImage(backgroundFile);
                backgroundImage = upload.data.url;
            }

            return updateMyProfile({
                ...payload,
                profileImage,
                backgroundImage,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
            pushToast({
                type: "success",
                title: "Profile updated",
                description: "Your profile has been saved.",
            });
            router.push("/profile");
        },
        onError: () => {
            pushToast({
                type: "error",
                title: "Update failed",
                description: "Please check your inputs and try again.",
            });
        },
    });

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#050d1f] px-4 py-8 md:px-6">
                <div className="mx-auto w-full max-w-[1040px] space-y-6">
                    <section className="rounded-2xl border border-[#132849] bg-[linear-gradient(180deg,#0a1730,#0a1b34)] p-6 md:p-8">
                        <h1 className="text-4xl font-semibold text-white">Edit Profile</h1>
                        <p className="mt-2 text-[#7f98be]">
                            Keep your profile fresh so collaborators can learn about your latest work.
                        </p>
                    </section>

                    <section className="rounded-2xl border border-[#132849] bg-[linear-gradient(180deg,#081327,#09182d)] p-6 md:p-8">
                        {profileQuery.isLoading ? (
                            <div className="flex items-center gap-2 text-[#9bb0cf]">
                                <Spinner size={18} />
                                <span className="text-sm">Loading profile...</span>
                            </div>
                        ) : profileQuery.isError || !profileQuery.data?.data ? (
                            <div className="rounded-lg border border-red-900/40 bg-red-950/50 p-4 text-sm text-red-300">
                                Failed to load profile.
                            </div>
                        ) : (
                            <ProfileForm
                                initial={profileQuery.data.data.profile}
                                loading={mutation.isPending}
                                onCancel={() => router.push("/profile")}
                                onSubmit={(
                                    payload,
                                    imageFile,
                                    removeImage,
                                    backgroundFile,
                                    removeBackgroundImage
                                ) =>
                                    mutation.mutate({
                                        payload,
                                        file: imageFile,
                                        removeImage,
                                        backgroundFile,
                                        removeBackgroundImage,
                                    })
                                }
                            />
                        )}
                    </section>
                </div>
            </div>
        </ProtectedRoute>
    );
}
