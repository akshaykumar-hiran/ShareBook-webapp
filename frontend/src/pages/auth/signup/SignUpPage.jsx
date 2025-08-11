import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import XSvg from "../../../components/svgs/X";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdDriveFileRenameOutline } from "react-icons/md";

const defaultProfile = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
console.log(import.meta.env.VITE_API_URL);

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
		profileImg: defaultProfile,
	});

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { mutate, isError, isPending, error } = useMutation({
		mutationFn: async (formData) => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, { 
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});
			const data = await res.json();
			if (!res.ok || data.error) throw new Error(data.error || "Signup failed");
			return data;
		},
		onSuccess: async (data) => {
			toast.success("Account created");
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-verify-otp`, {
				method: "POST",
				credentials: "include",
			});
			const result = await res.json();

			if (!res.ok) {
				toast.error(result.error || "Failed to send OTP");
				return;
			}

			toast.success("OTP sent to your email");
			queryClient.invalidateQueries(["authUser"]);
			navigate(`/verify-otp?userId=${data.userId}`);
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		mutate(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onloadend = () => {
			setFormData((prev) => ({ ...prev, profileImg: reader.result }));
		};
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 bg-[#0F172A]">
			<div className="w-full max-w-4xl bg-gradient-to-br from-[#7B2FF7]/30 to-[#2C3E50]/30 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 text-white">
				<div className="flex flex-col items-center">
					<XSvg className="w-20 mb-4 fill-white drop-shadow-lg" />

					<h1 className="text-3xl font-bold mb-6">Create your account</h1>

					{/* Profile Picture Upload */}
					<div className="relative w-24 h-24 mb-6">
						<img
							src={formData.profileImg || defaultProfile}
							alt="Profile"
							className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
						/>
						<input
							type="file"
							accept="image/*"
							className="absolute inset-0 opacity-0 cursor-pointer"
							onChange={handleImageChange}
						/>
						<div className="absolute bottom-0 right-0 bg-white/20 p-1 rounded-full backdrop-blur-sm text-white text-xs">
							✏️
						</div>
					</div>

					<form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 text-white">
						{/* Email */}
						<label className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg border border-white/20">
							<MdOutlineMail className="text-xl text-purple-300" />
							<input
								type="email"
								name="email"
								placeholder="Email"
								value={formData.email}
								onChange={handleInputChange}
								className="bg-transparent w-full outline-none text-white placeholder:text-white/60"
							/>
						</label>

						{/* Username + FullName */}
						<div className="flex gap-3 flex-wrap">
							<label className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg border border-white/20">
								<FaUser className="text-lg text-purple-300" />
								<input
									type="text"
									name="username"
									placeholder="Username"
									value={formData.username}
									onChange={handleInputChange}
									className="bg-transparent w-full outline-none text-white placeholder:text-white/60"
								/>
							</label>
							<label className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg border border-white/20">
								<MdDriveFileRenameOutline className="text-lg text-purple-300" />
								<input
									type="text"
									name="fullName"
									placeholder="Full Name"
									value={formData.fullName}
									onChange={handleInputChange}
									className="bg-transparent w-full outline-none text-white placeholder:text-white/60"
								/>
							</label>
						</div>

						{/* Password */}
						<label className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg border border-white/20">
							<MdPassword className="text-xl text-purple-300" />
							<input
								type="password"
								name="password"
								placeholder="Password"
								value={formData.password}
								onChange={handleInputChange}
								className="bg-transparent w-full outline-none text-white placeholder:text-white/60"
							/>
						</label>

						{/* Submit Button */}
						<button
							type="submit"
							className="w-full py-3 bg-purple-600 hover:bg-purple-700 transition rounded-full shadow-lg font-semibold"
						>
							{isPending ? "Signing up..." : "Sign Up"}
						</button>

						{isError && (
							<p className="text-red-400 text-sm text-center">
								{error.message}
							</p>
						)}
					</form>

					{/* Link to Login */}
					<div className="text-center mt-6 text-white/80">
						<p>Already have an account?</p>
						<Link
							to="/login"
							className="inline-block mt-2 text-[#b99aff] hover:underline"
						>
							Sign In
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUpPage;
