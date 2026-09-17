"use client";
"use client";
import { useEffect as e, useId as t, useRef as n, useState as r } from "react";
import { jsx as i, jsxs as a } from "react/jsx-runtime";
//#region packages/react/src/validation.ts
var o = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/avif"
], s = (e) => JSON.stringify([
	e.name,
	e.size,
	e.lastModified,
	e.type
]), c = class extends Error {
	constructor(e, t) {
		super(t), this.code = e;
	}
};
function l(e) {
	let t = (t, n) => String.fromCharCode(...e.slice(t, n));
	return e[0] === 255 && e[1] === 216 && e[2] === 255 ? "image/jpeg" : [
		137,
		80,
		78,
		71,
		13,
		10,
		26,
		10
	].every((t, n) => e[n] === t) ? "image/png" : t(0, 6) === "GIF87a" || t(0, 6) === "GIF89a" ? "image/gif" : t(0, 4) === "RIFF" && t(8, 12) === "WEBP" ? "image/webp" : t(4, 8) === "ftyp" && [
		8,
		16,
		20,
		24,
		28
	].some((e) => ["avif", "avis"].includes(t(e, e + 4))) ? "image/avif" : null;
}
function u(e) {
	return e < 1024 ? `${e} B` : e < 1024 ** 2 ? `${(e / 1024).toFixed(1)} KB` : `${(e / 1024 ** 2).toFixed(1)} MB`;
}
function d(e, t, n) {
	let r = (t, n) => ({
		file: e,
		code: t,
		message: n
	});
	return (n.accept ?? o).includes(e.type) ? e.size === 0 ? r("decode", "This file is empty.") : e.size > (n.maxSize ?? 10 * 1024 ** 2) ? r("size", `Exceeds the ${u(n.maxSize ?? 10 * 1024 ** 2)} limit.`) : t.some((t) => s(t) === s(e)) ? r("duplicate", "This image is already selected.") : t.length >= (n.multiple === !1 ? 1 : n.maxFiles ?? 8) ? r("count", "The selection is full. Remove an image to add another.") : null : r("type", "This image format is not supported.");
}
async function f(e, t = 4e7) {
	let n = l(new Uint8Array(await e.slice(0, 32).arrayBuffer()));
	if (!n || n !== e.type) throw new c("type", "The file contents don’t match a supported image format.");
	let r = URL.createObjectURL(e);
	try {
		return await new Promise((e, n) => {
			let i = new Image(), a = setTimeout(() => {
				i.onload = null, i.onerror = null, i.src = "", n(new c("decode", "The image took too long to open."));
			}, 15e3);
			i.onload = () => {
				clearTimeout(a), !i.naturalWidth || i.naturalWidth * i.naturalHeight > t ? n(new c("dimensions", `Image must be within ${Math.round(t / 1e6)} megapixels.`)) : e({
					width: i.naturalWidth,
					height: i.naturalHeight
				});
			}, i.onerror = () => {
				clearTimeout(a), n(new c("decode", "This file could not be decoded as an image."));
			}, i.src = r;
		});
	} finally {
		URL.revokeObjectURL(r);
	}
}
//#endregion
//#region packages/react/src/ImagePicker.tsx
function p(t) {
	let [n, i] = r("");
	return e(() => {
		let e = URL.createObjectURL(t);
		return i(e), () => URL.revokeObjectURL(e);
	}, [t]), n;
}
function m({ file: e, disabled: t, onRemove: n, onPreview: o }) {
	let s = p(e), [c, l] = r("");
	return /* @__PURE__ */ a("li", {
		className: "fp-file",
		children: [/* @__PURE__ */ a("div", {
			className: "fp-thumbnail",
			children: [/* @__PURE__ */ a("button", {
				type: "button",
				className: "fp-preview-button",
				onClick: o,
				"aria-label": `Preview ${e.name}`,
				children: [s && /* @__PURE__ */ i("img", {
					src: s,
					alt: "",
					onLoad: (e) => l(`${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight}`)
				}), /* @__PURE__ */ i("span", {
					className: "fp-expand",
					"aria-hidden": "true",
					children: "⤢"
				})]
			}), /* @__PURE__ */ i("button", {
				className: "fp-remove",
				type: "button",
				disabled: t,
				"aria-label": `Remove ${e.name}`,
				onClick: n,
				children: "×"
			})]
		}), /* @__PURE__ */ a("div", {
			className: "fp-file-info",
			children: [
				/* @__PURE__ */ i("strong", {
					title: e.name,
					children: e.name
				}),
				/* @__PURE__ */ a("span", { children: [
					u(e.size),
					" ·",
					" ",
					e.type.replace("image/", "").toUpperCase()
				] }),
				c && /* @__PURE__ */ a("span", { children: [c, " px"] })
			]
		})]
	});
}
function h({ file: r, onClose: o }) {
	let s = p(r), c = n(null), l = t();
	return e(() => {
		let e = c.current, t = document.activeElement;
		return e?.showModal(), () => {
			e?.close(), t?.focus();
		};
	}, []), /* @__PURE__ */ a("dialog", {
		ref: c,
		className: "fp-dialog",
		"aria-labelledby": l,
		onCancel: (e) => {
			e.preventDefault(), o();
		},
		onClick: (e) => {
			e.target === c.current && o();
		},
		children: [
			/* @__PURE__ */ a("div", {
				className: "fp-dialog-header",
				children: [/* @__PURE__ */ a("div", { children: [/* @__PURE__ */ i("h2", {
					id: l,
					children: r.name
				}), /* @__PURE__ */ a("p", { children: [u(r.size), " · Preview"] })] }), /* @__PURE__ */ i("button", {
					type: "button",
					"aria-label": "Close preview",
					onClick: o,
					autoFocus: !0,
					children: "×"
				})]
			}),
			/* @__PURE__ */ i("div", {
				className: "fp-dialog-image",
				children: s && /* @__PURE__ */ i("img", {
					src: s,
					alt: r.name
				})
			}),
			/* @__PURE__ */ i("p", {
				className: "fp-dialog-footer",
				children: "Press Escape to close"
			})
		]
	});
}
function g({ value: l, defaultValue: p = [], onValueChange: g, onReject: _, onBusyChange: v, disabled: y = !1, className: b = "", label: x = "Choose your images", helperText: S = "Images are selected locally. Your app controls what happens next.", accept: C = o, multiple: w = !0, maxFiles: T = 8, maxSize: E = 10 * 1024 ** 2, maxPixels: D = 4e7 }) {
	let [O, k] = r(p), A = l ?? O, j = n(A);
	j.current = A;
	let M = n({
		value: l,
		onValueChange: g,
		onReject: _,
		onBusyChange: v,
		disabled: y,
		accept: C,
		multiple: w,
		maxFiles: T,
		maxSize: E,
		maxPixels: D
	});
	M.current = {
		value: l,
		onValueChange: g,
		onReject: _,
		onBusyChange: v,
		disabled: y,
		accept: C,
		multiple: w,
		maxFiles: T,
		maxSize: E,
		maxPixels: D
	};
	let N = n(null), P = n(null), F = n(!0), I = n(Promise.resolve()), L = n(0), R = n(0), [z, B] = r(!1), [V, H] = r(!1), [U, W] = r([]), [G, K] = r(""), [q, J] = r(null), Y = t();
	e(() => (F.current = !0, () => {
		F.current = !1;
	}), []);
	let X = (e) => {
		j.current = e, M.current.value === void 0 && k(e), M.current.onValueChange?.(e);
	}, Z = (e) => {
		M.current.disabled || !e.length || (K(""), L.current++, H(!0), M.current.onBusyChange?.(!0), I.current = I.current.catch(() => void 0).then(async () => {
			if (!F.current || M.current.disabled) return;
			let t = j.current, n = [], r = [];
			for (let i of e) {
				if (!F.current || M.current.disabled || j.current !== t) return;
				let e = d(i, [...t, ...r], M.current);
				if (e) {
					n.push(e);
					continue;
				}
				try {
					await f(i, M.current.maxPixels), r.push(i);
				} catch (e) {
					n.push({
						file: i,
						code: e instanceof c ? e.code : "decode",
						message: e instanceof Error ? e.message : "Could not open this image."
					});
				}
			}
			!F.current || M.current.disabled || j.current !== t || (r.length && X([...t, ...r]), W(n), K(`${r.length} image${r.length === 1 ? "" : "s"} added. ${n.length ? `${n.length} rejected.` : ""}`), n.length && M.current.onReject?.(n));
		}).finally(() => {
			L.current--, F.current && L.current === 0 && (H(!1), M.current.onBusyChange?.(!1));
		}));
	}, Q = (e) => {
		X(A.filter((t) => s(t) !== s(e))), W([]), K(`${e.name} removed.`), P.current?.focus();
	}, $ = () => {
		X([]), W([]), K("Selection cleared."), P.current?.focus();
	}, ee = C.map((e) => e.replace("image/", "").replace("jpeg", "jpg").toUpperCase()).join(", ");
	return /* @__PURE__ */ a("section", {
		className: `fp-root ${b}`,
		"aria-label": x,
		"aria-busy": V,
		children: [
			/* @__PURE__ */ a("div", {
				className: "fp-heading",
				children: [/* @__PURE__ */ a("div", { children: [/* @__PURE__ */ i("h2", { children: x }), /* @__PURE__ */ i("p", { children: w ? "A few favourites, or a whole collection." : "One image. A world of possibilities." })] }), /* @__PURE__ */ a("span", {
					className: "fp-count",
					children: [
						A.length,
						" / ",
						w ? T : 1
					]
				})]
			}),
			/* @__PURE__ */ a("div", {
				className: `fp-dropzone ${z ? "fp-dragging" : ""} ${y ? "fp-disabled" : ""}`,
				onDragEnter: (e) => {
					e.preventDefault(), !(y || !e.dataTransfer.types.includes("Files")) && (R.current++, B(!0));
				},
				onDragOver: (e) => {
					e.preventDefault(), e.dataTransfer.dropEffect = y ? "none" : "copy";
				},
				onDragLeave: (e) => {
					e.preventDefault(), R.current--, R.current <= 0 && (R.current = 0, B(!1));
				},
				onDrop: (e) => {
					e.preventDefault(), R.current = 0, B(!1), Z(Array.from(e.dataTransfer.files));
				},
				children: [
					/* @__PURE__ */ a("div", {
						className: "fp-drop-icon",
						"aria-hidden": "true",
						children: [/* @__PURE__ */ a("svg", {
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "1.5",
							children: [
								/* @__PURE__ */ i("rect", {
									x: "3",
									y: "3",
									width: "18",
									height: "18",
									rx: "4"
								}),
								/* @__PURE__ */ i("circle", {
									cx: "8",
									cy: "8",
									r: "1.5"
								}),
								/* @__PURE__ */ i("path", { d: "m3 17 5-5 4 4 4-6 5 7" })
							]
						}), /* @__PURE__ */ i("span", { children: "+" })]
					}),
					/* @__PURE__ */ i("h3", { children: z ? "Right here. Drop them in." : "Your next idea starts here." }),
					/* @__PURE__ */ i("p", { children: "Drag & drop your images, or choose from your device." }),
					/* @__PURE__ */ a("button", {
						ref: P,
						className: "fp-browse",
						type: "button",
						disabled: y || V,
						onClick: () => N.current?.click(),
						"aria-describedby": `${Y}-help`,
						children: [V ? "Checking images…" : "Browse files", /* @__PURE__ */ i("span", {
							"aria-hidden": "true",
							children: "↗"
						})]
					}),
					/* @__PURE__ */ i("input", {
						ref: N,
						id: `${Y}-input`,
						type: "file",
						accept: C.join(","),
						multiple: w,
						disabled: y || V,
						"aria-label": x,
						tabIndex: -1,
						className: "fp-hidden-input",
						onChange: (e) => {
							Z(Array.from(e.target.files ?? [])), e.target.value = "";
						}
					}),
					/* @__PURE__ */ a("p", {
						className: "fp-help",
						id: `${Y}-help`,
						children: [
							ee,
							" · Up to ",
							u(E),
							" each"
						]
					})
				]
			}),
			U.length > 0 && /* @__PURE__ */ a("div", {
				className: "fp-errors",
				role: "alert",
				children: [
					/* @__PURE__ */ i("strong", { children: "Some images couldn’t be added" }),
					/* @__PURE__ */ i("ul", { children: U.slice(0, 10).map((e, t) => /* @__PURE__ */ a("li", { children: [
						/* @__PURE__ */ i("b", { children: e.file.name }),
						": ",
						e.message
					] }, t)) }),
					U.length > 10 && /* @__PURE__ */ a("p", { children: [
						"And ",
						U.length - 10,
						" more. Try a smaller batch."
					] }),
					/* @__PURE__ */ i("button", {
						type: "button",
						onClick: () => {
							W([]), P.current?.focus();
						},
						children: "Dismiss"
					})
				]
			}),
			A.length > 0 && /* @__PURE__ */ a("div", {
				className: "fp-selection",
				children: [/* @__PURE__ */ a("div", {
					className: "fp-selection-heading",
					children: [/* @__PURE__ */ a("h3", { children: ["Selected images ", /* @__PURE__ */ i("span", { children: A.length })] }), /* @__PURE__ */ i("button", {
						type: "button",
						disabled: y || V,
						onClick: $,
						children: "Clear all"
					})]
				}), /* @__PURE__ */ i("ul", {
					className: "fp-grid",
					children: A.map((e) => /* @__PURE__ */ i(m, {
						file: e,
						disabled: y || V,
						onRemove: () => Q(e),
						onPreview: () => J(e)
					}, s(e)))
				})]
			}),
			S && /* @__PURE__ */ a("p", {
				className: "fp-privacy",
				children: [/* @__PURE__ */ a("svg", {
					"aria-hidden": "true",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.5",
					children: [/* @__PURE__ */ i("rect", {
						x: "5",
						y: "10",
						width: "14",
						height: "11",
						rx: "3"
					}), /* @__PURE__ */ i("path", { d: "M8 10V7a4 4 0 0 1 8 0v3" })]
				}), S]
			}),
			/* @__PURE__ */ i("span", {
				className: "fp-sr-only",
				role: "status",
				"aria-live": "polite",
				children: G
			}),
			q && /* @__PURE__ */ i(h, {
				file: q,
				onClose: () => J(null)
			})
		]
	});
}
//#endregion
export { o as IMAGE_TYPES, g as ImagePicker, u as formatBytes };
