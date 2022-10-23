import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Project } from "../Project";
import ProjectForm, { validate } from "../ProjectForm";
import { Provider } from "react-redux";
import { store } from "../../state";
import userEvent from "@testing-library/user-event";
import { mockProject } from "../mockProjects";

describe("<ProjectForm />", () => {
	let project: Project;
	let updatedProject: Project;
	let handleCancel: jest.Mock;
	let nameTextBox: any;
	let descriptionTextBox: HTMLElement;
	let budgetTextBox: HTMLElement;

	const setup = () => {
		render(
			<Provider store={store}>
				<MemoryRouter>
					<ProjectForm project={project} onCancel={handleCancel} />
				</MemoryRouter>
			</Provider>
		);

		nameTextBox = screen.getByRole("textbox", {
			name: /project name/i,
		});
		descriptionTextBox = screen.getByRole("textbox", {
			name: /project description/i,
		});
		budgetTextBox = screen.getByRole("spinbutton", {
			name: /project budget/i,
		});
	};

	beforeEach(() => {
		project = new Project({
			id: 1,
			name: "Mission Impossible",
			description: "This is really difficult",
			budget: 100,
		});
		updatedProject = new Project({
			name: "Ghost Protocol",
			description:
				"Blamed for a terrorist attack on the Kremlin, Ethan Hunt (Tom Cruise) and the entire IMF agency...",
		});
		handleCancel = jest.fn();
	});

	// We need to export the validate function to test it. Lets run some tests on it
	// ! Unit test
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
			budget: "Budget must be more than $0.",
		});
	});

	test("should load project into form", () => {
		setup();
		expect(
			screen.getByRole("form", {
				name: /edit a project/i,
			})
		).toHaveFormValues({
			name: project.name,
			description: project.description,
			budget: project.budget,
			isActive: project.isActive,
		});
	});

	test("should accept input", async () => {
		setup();
		const view = userEvent.setup();
		await view.clear(nameTextBox);
		await view.type(nameTextBox, updatedProject.name);
		expect(nameTextBox).toHaveValue(updatedProject.name);

		await view.clear(descriptionTextBox);
		await view.type(descriptionTextBox, updatedProject.description);
		expect(descriptionTextBox).toHaveValue(updatedProject.description);

		await view.clear(budgetTextBox);
		await view.type(budgetTextBox, updatedProject.budget.toString());
		expect(budgetTextBox).toHaveValue(updatedProject.budget);
	});

	// Test that there are two buttons and canancel press calls the handleCancel function
	// ! Unit test
	test("should display save and cancel buttons", async () => {
		setup();

		const view = userEvent.setup();

		const submitButton = screen.getByRole("button", { name: /save/i });
		const cancelButton = screen.getByRole("button", { name: /cancel/i });
		expect(submitButton).toBeInTheDocument();
		expect(cancelButton).toBeInTheDocument();
		return view.click(cancelButton).then(() => {
			// expect to close the form
			expect(handleCancel).toHaveBeenCalled();
		});
	});

	test("name should display required validation", async () => {
		setup();
		const view = userEvent.setup();
		await view.clear(nameTextBox);
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});

	test("name should display minlength validation", async () => {
		setup();
		const view = userEvent.setup();
		await view.clear(nameTextBox);
		await view.type(nameTextBox, "ab");
		expect(screen.getByRole("alert")).toBeInTheDocument();
		await view.type(nameTextBox, "c");
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	test("budget should display not 0 validation", async () => {
		setup();
		const view = userEvent.setup();
		await view.clear(budgetTextBox);
		await view.type(budgetTextBox, "0");
		expect(screen.getByRole("alert")).toBeInTheDocument();
		await view.type(budgetTextBox, "1");
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();

		// We can reproduce the bug here with RTL type testing.
		await view.type(budgetTextBox, "-1");
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});
});
