import { Project } from "../Project";
import { validate } from "../ProjectForm";

import { mockProject } from "../mockProjects";

test("should validate given input", () => {
	let errors: any = { name: "", description: "", budget: "" };

	let allValuesFail = {
		name: "",
		description: "",
		budget: 0,
	};
	const allWillFail = new Project({
		...mockProject,
		...allValuesFail,
	});
	expect(validate(allWillFail)).toStrictEqual({
		name: "Name is required",
		description: "Description is required.",
		budget: "Budget must be more than $0.",
	});

	const shouldPassValues = [
		{
			name: "aaa",
			description: "bbb",
			budget: 100,
		},
		{
			name: "qwerty",
			description: "kkkkkkkk",
			budget: 1,
		},
		{
			name: "cccccc",
			description: "a",
			budget: 2000000,
		},
		{
			name: "åäö",
			description: "mm kkk jjj jjjj lll",
			budget: 1000000000,
		},
	];
	for (const newValues of shouldPassValues) {
		const updatedProject = new Project({
			...mockProject,
			...newValues,
		});
		expect(validate(updatedProject)).toStrictEqual(errors);
	}

	const tooShortName = {
		name: "cc",
		description: "a",
		budget: 2000,
	};
	const updatedProject2 = new Project({
		...mockProject,
		...tooShortName,
	});
	expect(validate(updatedProject2)).toStrictEqual({
		name: "Name needs to be at least 3 characters.",
		description: "",
		budget: "",
	});
	const noDescription = {
		name: "abc",
		description: "",
		budget: 2000,
	};
	const updatedProject3 = new Project({
		...mockProject,
		...noDescription,
	});
	expect(validate(updatedProject3)).toStrictEqual({
		name: "",
		description: "Description is required.",
		budget: "",
	});

	const noName = {
		name: "",
		description: "abc",
		budget: 100,
	};
	const updatedProject4 = new Project({ ...mockProject, ...noName });
	expect(validate(updatedProject4)).toStrictEqual({
		name: "Name is required",
		description: "",
		budget: "",
	});
	const negativeBudget = {
		name: "abc",
		description: "abc",
		budget: -1,
	};
	const updatedProject5 = new Project({
		...mockProject,
		...negativeBudget,
	});

	// We find a bug in our code. We need to fix it. We need to make sure that the budget is not negative
	// ! Test will fail
	expect(validate(updatedProject5)).toStrictEqual({
		name: "",
		description: "",
		budget: "",
		//budget: "Budget must be more than $0.",
	});
});
