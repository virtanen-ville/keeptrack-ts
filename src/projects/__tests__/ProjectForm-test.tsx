import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Project } from "../Project";
import ProjectForm from "../ProjectForm";
import { Provider } from "react-redux";
import { store } from "../../state";
import userEvent from "@testing-library/user-event";
import { allProjects } from "../mockProjects";

describe("<ProjectForm />", () => {
	let nameTextBox: HTMLElement;
	let descriptionTextBox: HTMLElement;
	let budgetTextBox: HTMLElement;
	const handleCancel = jest.fn();
	let project = allProjects[Math.floor(Math.random() * allProjects.length)];

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

	// ! Unit test
	// Test that the random project is loaded in the form
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

	// Test that the form values can be changed
	// ! Unit test
	test("should accept input", async () => {
		setup();
		const updatedProject = new Project({
			name: "Uusinimi",
			description: "Uusikuvaus",
			budget: 100000,
		});
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

	// Test that there are two buttons and cancel press calls the handleCancel function
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

	// Test that the name is required
	// ! Unit test
	test("name should display required validation", async () => {
		setup();
		const view = userEvent.setup();
		await view.clear(nameTextBox);
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});

	// Test that the name should be at least 3 characters
	// ! Unit test
	test("name should display minlength validation", async () => {
		setup();
		const view = userEvent.setup();
		await view.clear(nameTextBox);
		await view.type(nameTextBox, "ab");
		expect(screen.getByRole("alert")).toBeInTheDocument();
		await view.type(nameTextBox, "c");
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	// Test that the budget should be larger than 0
	// ! Unit test
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

		// TODO: Fix this bug
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});
});
