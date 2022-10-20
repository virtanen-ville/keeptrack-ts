import React from "react";
import { render, screen } from "@testing-library/react";

import App from "./App";

// This block tests the App component (the main component).
describe("<App />", () => {
	// Test that the App loads without crashing.
	test("should load the main App without crashing", () => {
		render(<App />);
	});

	// Test that there are two navigation links that have the correct text (Home and Projects).
	test("should render navigation links Home and Projects", () => {
		render(<App />);

		// We could get the link by name too, but lets check for the text instead.
		//const homeLink = screen.getByRole("link", { name: /home/i });
		const links = screen.getAllByRole("link");

		// Check that there are two links.
		expect(links.length).toBe(2);

		// Check that the first link has the text "Home".
		expect(links[0]).toHaveTextContent(/home/i);

		// Check that the second link has the text "Projects".
		expect(links[1]).toHaveTextContent(/projects/i);
	});

	// Check that the Home component renders (That has a heading of text Home).
	test("should render Homepage with Home heading", () => {
		render(<App />);
		expect(screen.getByRole("heading")).toHaveTextContent("Home");
	});

	// Test that the logo file is rendered as image.
	test("should render an image with logo", () => {
		render(<App />);
		const image = screen.getByRole("img", { name: /logo/i });
		expect(image).toHaveAttribute("src", "/assets/logo-3.svg");
		expect(image).toBeInTheDocument();
	});
});
