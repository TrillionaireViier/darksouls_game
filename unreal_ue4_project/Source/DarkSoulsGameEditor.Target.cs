// Copyright Dark Souls Game Project. All Rights Reserved. UE 4.22 - 4.24

using UnrealBuildTool;
using System.Collections.Generic;

public class DarkSoulsGameEditorTarget : TargetRules
{
	public DarkSoulsGameEditorTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Editor;
		DefaultBuildSettings = BuildSettingsVersion.V2;
		ExtraModuleNames.Add("DarkSoulsGame");
	}
}
